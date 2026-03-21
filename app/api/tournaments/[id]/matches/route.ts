import { NextResponse } from "next/server";
import { buildSingleEliminationMatches } from "@/lib/bracket";
import { buildRoundRobinMatches } from "@/lib/round-robin";
import { createServerSupabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";

function resolveId(raw: string | string[] | undefined) {
  return Array.isArray(raw) ? raw[0] : raw;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string | string[] | undefined }> }
) {
  const id = (await context.params).id;
  const resolvedId = resolveId(id);
  console.log("API Request for ID:", resolvedId);
  if (!resolvedId || !isUuid(resolvedId)) {
    return NextResponse.json(
      { error: "Invalid tournament id in request params.", source: "api-validation" },
      { status: 422 }
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", resolvedId)
    .order("round", { ascending: true })
    .order("match_number", { ascending: true });

  if (error) {
    console.log("Supabase GET /matches error:", error);
    return NextResponse.json(
      {
        error: `Supabase matches query failed for tournament_id=${resolvedId}: ${error.message}`,
        source: "supabase",
        supabaseError: error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string | string[] | undefined }> }
) {
  const id = (await context.params).id;
  const resolvedId = resolveId(id);
  console.log("API Request for ID:", resolvedId);
  if (!resolvedId || !isUuid(resolvedId)) {
    return NextResponse.json(
      { error: "Invalid tournament id in request params.", source: "api-validation" },
      { status: 422 }
    );
  }

  const { type } = (await request.json()) as { type?: string };
  const supabase = createServerSupabase();

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", resolvedId);

  if (playersError) {
    return NextResponse.json(
      {
        error: `Supabase players query failed: ${playersError.message}`,
        source: "supabase",
        supabaseError: playersError,
      },
      { status: 400 }
    );
  }

  const safePlayers = (players ?? []) as Player[];
  const tournamentType = type === "round_robin" ? "round_robin" : "single_elimination";
  console.log("Server start payload:", { tournament_id: resolvedId, type: tournamentType });
  const matches =
    tournamentType === "round_robin"
      ? buildRoundRobinMatches(resolvedId, safePlayers)
      : buildSingleEliminationMatches(resolvedId, safePlayers);
  if (matches.length === 0) {
    return NextResponse.json(
      { error: "Need at least 2 players to generate bracket." },
      { status: 422 }
    );
  }

  await supabase.from("matches").delete().eq("tournament_id", resolvedId);

  const { data, error } = await supabase
    .from("matches")
    .insert(matches)
    .select("*");

  if (error) {
    return NextResponse.json(
      {
        error: `Supabase matches insert failed: ${error.message}`,
        source: "supabase",
        supabaseError: error,
      },
      { status: 400 }
    );
  }

  const inserted = data ?? [];
  const byKey = new Map<string, string>();
  const maxRound = inserted.reduce((max, row) => Math.max(max, row.round), 1);

  for (const row of inserted) {
    byKey.set(`r${row.round}m${row.match_number}`, row.id);
  }

  if (tournamentType === "single_elimination") {
    for (const row of inserted) {
      if (row.round >= maxRound) continue;
      const nextRound = row.round + 1;
      const nextMatchNumber = Math.ceil(row.match_number / 2);
      const nextMatchId = byKey.get(`r${nextRound}m${nextMatchNumber}`) ?? null;
      if (!nextMatchId) continue;

      await supabase
        .from("matches")
        .update({ next_match_id: nextMatchId })
        .eq("id", row.id);
    }
  }

  const { data: refreshed } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", resolvedId)
    .order("round", { ascending: true })
    .order("match_number", { ascending: true });

  return NextResponse.json(refreshed ?? [], { status: 201 });
}
