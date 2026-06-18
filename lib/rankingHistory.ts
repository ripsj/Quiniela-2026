import {
  Match,
  Participant,
  Prediction,
} from "./types";

import { calculateMatchPoints } from "./scoring";

export function buildRankingHistory(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[]
) {

  const completedMatches = matches
    .filter(
      (m) => m.finalizado === "TRUE"
    )
    .sort(
      (a, b) =>
        Number(a.id) - Number(b.id)
    );

  const scores = new Map<
    string,
    number
  >();

  participants.forEach((p) => {
    scores.set(
      String(p.id),
      0
    );
  });

  const history: Record<
    string,
    string | number
  >[] = [];

  completedMatches.forEach(
    (match, index) => {

      predictions
        .filter(
          (p) =>
            Number(
              p.partido_id
            ) === Number(match.id)
        )
        .forEach(
          (prediction) => {

            const result =
              calculateMatchPoints(
                Number(
                  match.goles_local
                ),
                Number(
                  match.goles_visitante
                ),
                Number(
                  prediction.goles_local
                ),
                Number(
                  prediction.goles_visitante
                )
              );

            const current =
              scores.get(
                String(
                  prediction.participante_id
                )
              ) ?? 0;

            scores.set(
              String(
                prediction.participante_id
              ),
              current +
                result.points
            );
          }
        );

      const ranking =
        [...participants]
          .map((p) => ({
            nombre: p.nombre,
            puntos:
              scores.get(
                String(p.id)
              ) ?? 0,
          }))
          .sort(
            (a, b) =>
              b.puntos - a.puntos
          );

      const row: Record<
        string,
        string | number
      > = {
        partido: index + 1,
      };

      ranking.forEach(
        (player, pos) => {
          row[player.nombre] =
            pos + 1;
        }
      );

      history.push(row);
    }
  );

  return history;
}