import type { Match, Player } from "@/lib/types";

type NewMatch = Omit<Match, "id" | "created_at">;

function nextPowerOfTwo(value: number) {
  let power = 1;
  while (power < value) {
    power *= 2;
  }
  return power;
}

export function buildSingleEliminationMatches(
  tournamentId: string,
  players: Player[]
): NewMatch[] {
  if (players.length < 2) return [];

  const fieldSize = nextPowerOfTwo(players.length);
  const rounds = Math.log2(fieldSize);
  const seeded = [...players];
  const matches: NewMatch[] = [];
  for (let round = 1; round <= rounds; round += 1) {
    const matchesInRound = fieldSize / 2 ** round;
    for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber += 1) {
      let player1Id: string | null = null;
      let player2Id: string | null = null;
      let winnerId: string | null = null;
      let status: Match["status"] = "pending";

      if (round === 1) {
        player1Id = seeded[(matchNumber - 1) * 2]?.id ?? null;
        player2Id = seeded[(matchNumber - 1) * 2 + 1]?.id ?? null;

        if (player1Id && !player2Id) {
          winnerId = player1Id;
          status = "completed";
        }
      }

      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNumber,
        player1_id: player1Id,
        player2_id: player2Id,
        score1: null,
        score2: null,
        winner_id: winnerId,
        next_match_id: null,
        status,
      });
    }
  }

  return matches;
}
