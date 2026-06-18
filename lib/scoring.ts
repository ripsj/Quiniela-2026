export function calculateMatchPoints(
  realHome: number,
  realAway: number,
  predHome: number,
  predAway: number
) {
  let points = 0;
  let exact = false;
  let result = false;

  const realResult =
    realHome > realAway
      ? "H"
      : realHome < realAway
      ? "A"
      : "D";

  const predResult =
    predHome > predAway
      ? "H"
      : predHome < predAway
      ? "A"
      : "D";

  if (realResult === predResult) {
    points += 1;
    result = true;
  }

  if (
    realHome === predHome &&
    realAway === predAway
  ) {
    points += 1;
    exact = true;
  }

  return {
    points,
    exact,
    result,
  };
}