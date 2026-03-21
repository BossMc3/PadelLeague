import { NextResponse } from "next/server";
import { calculateElo } from "@/lib/elo";
import { createServerSupabase } from "@/lib/supabase";
import type { Match, Player } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const score1 = Number(body.score1);
  const score2 = Number(body.score2);
  const supabase = createServerSupabase();

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }

  const typedMatch = match as Match;
  if (typedMatch.status === "completed") {
    return NextResponse.json(
      { error: "Match already completed." },
      { status: 409 }
    );
  }

  if (!typedMatch.player1_id || !typedMatch.player2_id) {
    return NextResponse.json(
      { error: "Both players must exist before scoring." },
      { status: 422 }
    );
  }

  const winnerId = score1 >= score2 ? typedMatch.player1_id : typedMatch.player2_id;

  const { data: updated, error: updateError } = await supabase
    .from("matches")
    .update({
      score1,
      score2,
      winner_id: winnerId,
      status: "completed",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (typedMatch.next_match_id) {
    const { data: nextMatch } = await supabase
      .from("matches")
      .select("*")
      .eq("id", typedMatch.next_match_id)
      .single();

    if (nextMatch) {
      const sameSideWinner = typedMatch.match_number % 2 === 1;
      await supabase
        .from("matches")
        .update(
          sameSideWinner ? { player1_id: winnerId } : { player2_id: winnerId }
        )
        .eq("id", typedMatch.next_match_id);
    }
  }

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .in("id", [typedMatch.player1_id, typedMatch.player2_id]);

  const p1 = (players ?? []).find(
    (player) => player.id === typedMatch.player1_id
  ) as Player | undefined;
  const p2 = (players ?? []).find(
    (player) => player.id === typedMatch.player2_id
  ) as Player | undefined;

  if (p1 && p2) {
    const winnerIsP1 = winnerId === p1.id;
    const { winnerNext, loserNext } = calculateElo(
      winnerIsP1 ? p1.elo : p2.elo,
      winnerIsP1 ? p2.elo : p1.elo
    );

    await Promise.all([
      supabase
        .from("players")
        .update({ elo: winnerIsP1 ? winnerNext : loserNext })
        .eq("id", p1.id),
      supabase
        .from("players")
        .update({ elo: winnerIsP1 ? loserNext : winnerNext })
        .eq("id", p2.id),
    ]);
  }

  return NextResponse.json(updated);
}
