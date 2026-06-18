import {
  Match,
  Prediction,
  Participant,
} from "./types";

export function buildRecentForm(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[]
) {

  const completedMatches =
    matches
      .filter(
        (m) =>
          m.finalizado === "TRUE"
      )
      .sort(
        (a, b) =>
          Number(a.id) -
          Number(b.id)
      );

  const lastFive =
    completedMatches.slice(-5);

  const result = new Map<
    string,
    string[]
  >();

  participants.forEach((p) => {
    result.set(
      String(p.id),
      []
    );
  });

  lastFive.forEach(
    (match) => {

      predictions
        .filter(
          (p) =>
            Number(
              p.partido_id
            ) === Number(match.id)
        )
        .forEach(
          (prediction) => {

            const realHome =
              Number(
                match.goles_local
              );

            const realAway =
              Number(
                match.goles_visitante
              );

            const predHome =
              Number(
                prediction.goles_local
              );

            const predAway =
              Number(
                prediction.goles_visitante
              );

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

            let emoji = "🔴";

            if (
              realResult ===
              predResult
            ) {
              emoji = "🟢";
            }

            if (
              realHome === predHome &&
              realAway === predAway
            ) {
              emoji = "🟡";
            }

            result
              .get(
                prediction.participante_id
              )
              ?.push(emoji);
          }
        );
    }
  );

  return result;
}