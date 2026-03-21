export type TournamentType = "single_elimination" | "round_robin";
export type MatchStatus = "pending" | "live" | "completed";

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  created_at: string;
}

export interface Player {
  id: string;
  tournament_id: string;
  name: string;
  elo: number;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  next_match_id: string | null;
  status: MatchStatus;
  created_at: string;
}
