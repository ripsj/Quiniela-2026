import {
  Match,
  Participant,
  Prediction,
  SpecialPrediction,
} from "./types";

import { calculateMatchPoints } from "./scoring";
import { buildResolvedSpecialPointEvents } from "./specialPredictions";

export function buildRankingHistory(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[],
  specialPredictions: SpecialPrediction[] = []
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

  const appendRanking = (
    event: string | number
  ) => {
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
      partido: event,
    };

    ranking.forEach(
      (player, pos) => {
        row[player.nombre] =
          pos + 1;
      }
    );

    history.push(row);
  };

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

      appendRanking(index + 1);
    }
  );

  const specialEvents =
    buildResolvedSpecialPointEvents(
      participants,
      specialPredictions
    );

  specialEvents.forEach((event) => {
    event.participantIds.forEach((participantId) => {
      scores.set(
        participantId,
        (scores.get(participantId) ?? 0) +
          event.points
      );
    });

    appendRanking(
      `Especial: ${event.label}`
    );
  });

  return history;
}

export function buildRankingPositionChanges(
  history: Record<
    string,
    string | number
  >[]
) {
  const changes =
    new Map<string, number>();

  if (history.length < 2) {
    return changes;
  }

  const previous =
    history[
      history.length - 2
    ];
  const current =
    history[
      history.length - 1
    ];

  Object.keys(current)
    .filter(
      (key) =>
        key !== "partido"
    )
    .forEach((player) => {
      changes.set(
        player,
        Number(previous[player]) -
          Number(current[player])
      );
    });

  return changes;
}
