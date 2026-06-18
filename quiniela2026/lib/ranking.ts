import {
  Match,
  Prediction,
  Participant,
  RankingEntry,
} from "./types";

import { calculateMatchPoints } from "./scoring";

export function buildRanking(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[]
): RankingEntry[] {

  const ranking = new Map<
    string,
    RankingEntry
  >();

  participants.forEach((p) => {
    ranking.set(String(p.id), {
      participanteId: p.id,
      nombre: p.nombre,
      puntos: 0,
      exactos: 0,
      resultados: 0,
    });
  });

  matches.forEach((match) => {

    if (
        match.goles_local == null ||
        match.goles_visitante == null
    ) {
        return;
    }

    const realHome = Number(
      match.goles_local
    );

    const realAway = Number(
      match.goles_visitante
    );

    predictions
      .filter(
        (p) =>
          p.partido_id === match.id
      )
      .forEach((prediction) => {

        const result =
          calculateMatchPoints(
            Number(match.goles_local),
            Number(match.goles_visitante),
            Number(
              prediction.goles_local
            ),
            Number(
              prediction.goles_visitante
            )
          );

        const player =
        ranking.get(
            String(prediction.participante_id)
        );

        if (!player) return;

        player.puntos +=
          result.points;

        if (result.exact)
          player.exactos++;

        if (result.result)
          player.resultados++;
      });
  });

  
  return [...ranking.values()]
    .sort(
      (a, b) =>
        b.puntos - a.puntos
    );
}