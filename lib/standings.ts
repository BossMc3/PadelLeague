import type { Match, Player } from "@/lib/types";

export interface StandingRow {
  playerId: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  setsWon: number;
}

export function calculateStandings(players: Player[], matches: Match[]) {
  const rows = new Map<string, StandingRow>();

  for (const player of players) {
    rows.set(player.id, {
      playerId: player.id,
      name: player.name,
      elo: player.elo,
      wins: 0,
      losses: 0,
      setsWon: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== "completed") continue;
    if (!match.player1_id || !match.player2_id) continue;

    const p1 = rows.get(match.player1_id);
    const p2 = rows.get(match.player2_id);
    if (!p1 || !p2) continue;

    p1.setsWon += match.score1 ?? 0;
    p2.setsWon += match.score2 ?? 0;

    if (match.winner_id === p1.playerId) {
      p1.wins += 1;
      p2.losses += 1;
    } else if (match.winner_id === p2.playerId) {
      p2.wins += 1;
      p1.losses += 1;
    }
  }

  return [...rows.values()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
    return b.elo - a.elo;
  });
}
