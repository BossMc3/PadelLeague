export const DEFAULT_ELO = 1200;
const K_FACTOR = 32;

export function expectedScore(playerRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

export function calculateElo(
  winnerRating: number,
  loserRating: number,
  k = K_FACTOR
) {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  const winnerNext = Math.round(winnerRating + k * (1 - expectedWinner));
  const loserNext = Math.round(loserRating + k * (0 - expectedLoser));

  return { winnerNext, loserNext };
}
