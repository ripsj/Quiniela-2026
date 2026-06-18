export function buildComebacks(
  history: Record<
    string,
    string | number
  >[]
) {

  if (!history.length) {
    return null;
  }

  const first =
    history[0];

  const last =
    history[
      history.length - 1
    ];

  const players =
    Object.keys(first)
      .filter(
        (key) =>
          key !== "partido"
      );

  const comebacks =
    players.map(
      (player) => {

        const start =
          Number(
            first[player]
          );

        const end =
          Number(
            last[player]
          );

        return {
          nombre: player,
          inicio: start,
          actual: end,
          mejora:
            start - end,
        };
      }
    );

  return comebacks.sort(
    (a, b) =>
      b.mejora - a.mejora
  )[0];
}