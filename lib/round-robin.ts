import type { Match, Player } from "@/lib/types";

type NewMatch = Omit<Match, "id" | "created_at">;

export function buildRoundRobinMatches(
  tournamentId: string,
  players: Player[]
): NewMatch[] {
  if (players.length < 2) return [];

  const list = [...players];
  const hasBye = list.length % 2 === 1;
  const slots = hasBye ? [...list, null] : [...list];
  const totalRounds = slots.length - 1;
  const half = slots.length / 2;
  const matches: NewMatch[] = [];
  let matchNumber = 1;

  for (let round = 1; round <= totalRounds; round += 1) {
    for (let i = 0; i < half; i += 1) {
      const home = slots[i];
      const away = slots[slots.length - 1 - i];
      if (!home || !away) continue;

      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNumber,
        player1_id: home.id,
        player2_id: away.id,
        score1: null,
        score2: null,
        winner_id: null,
        next_match_id: null,
        status: "pending",
      });
      matchNumber += 1;
    }

    const fixed = slots[0];
    const rotated = slots.slice(1);
    rotated.unshift(rotated.pop() ?? null);
    slots.splice(0, slots.length, fixed, ...rotated);
  }

  return matches;
}
