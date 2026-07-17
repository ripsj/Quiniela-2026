import {
  Match,
  Prediction,
  Participant,
  RankingEntry,
  SpecialPrediction,
} from "./types";

import { calculateMatchPoints } from "./scoring";
import { buildSpecialPointSummaries } from "./specialPredictions";

function buildPendingMatchPotential(
  matches: Match[],
  predictions: Prediction[]
) {
  const pendingMatchIds = new Set(
    matches
      .filter(
        (match) =>
          match.finalizado !== "TRUE"
      )
      .map((match) => String(match.id))
  );
  const predictedMatchesByParticipant =
    new Map<string, Set<string>>();

  predictions.forEach((prediction) => {
    const matchId = String(
      prediction.partido_id
    );
    const hasValidScore =
      prediction.goles_local !== "" &&
      prediction.goles_visitante !== "" &&
      Number.isFinite(
        Number(prediction.goles_local)
      ) &&
      Number.isFinite(
        Number(prediction.goles_visitante)
      );

    if (
      !pendingMatchIds.has(matchId) ||
      !hasValidScore
    ) {
      return;
    }

    const participantId = String(
      prediction.participante_id
    );
    const predictedMatches =
      predictedMatchesByParticipant.get(
        participantId
      ) ?? new Set<string>();

    predictedMatches.add(matchId);
    predictedMatchesByParticipant.set(
      participantId,
      predictedMatches
    );
  });

  return new Map(
    [...predictedMatchesByParticipant].map(
      ([participantId, matchIds]) => [
        participantId,
        matchIds.size * 2,
      ]
    )
  );
}

export function buildRanking(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[],
  specialPredictions: SpecialPrediction[] = []
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
      puntosPartidos: 0,
      puntosEspeciales: 0,
      puntosPosiblesPartidos: 0,
      puntosPosiblesEspeciales: 0,
      puntosPosibles: 0,
      techoPuntos: 0,
      distanciaLider: 0,
      puedeAlcanzarLider: null,
      eliminadoMatematicamente: false,
      especialesDesconocidos: 0,
      exactos: 0,
      resultados: 0,
    });
  });

  matches.forEach((match) => {
    if (match.finalizado !== "TRUE") {
      return;
    }

    if (
        match.goles_local == null ||
        match.goles_visitante == null
    ) {
        return;
    }

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

        player.puntosPartidos +=
          result.points;

        if (result.exact)
          player.exactos++;

        if (result.result)
          player.resultados++;
      });
  });

  const specialSummaries =
    buildSpecialPointSummaries(
      participants,
      specialPredictions
    );
  const pendingMatchPotential =
    buildPendingMatchPotential(
      matches,
      predictions
    );

  ranking.forEach((player, participantId) => {
    const specialSummary =
      specialSummaries.get(participantId);

    player.puntosEspeciales =
      specialSummary?.confirmed ?? 0;
    player.puntosPosiblesPartidos =
      pendingMatchPotential.get(
        participantId
      ) ?? 0;
    player.puntosPosiblesEspeciales =
      specialSummary?.possible ?? 0;
    player.puntosPosibles =
      player.puntosPosiblesPartidos +
      player.puntosPosiblesEspeciales;
    player.especialesDesconocidos =
      specialSummary?.unknown ?? 0;
    player.puntos =
      player.puntosPartidos +
      player.puntosEspeciales;
    player.techoPuntos =
      player.puntos +
      player.puntosPosibles;
  });

  const sortedRanking = [...ranking.values()]
    .sort(
      (a, b) =>
        b.puntos - a.puntos ||
        b.exactos - a.exactos ||
        b.resultados - a.resultados ||
        a.nombre.localeCompare(
          b.nombre,
          "es"
        )
    );
  const leaderPoints =
    sortedRanking[0]?.puntos ?? 0;

  sortedRanking.forEach((player) => {
    player.distanciaLider = Math.max(
      0,
      leaderPoints - player.puntos
    );

    if (player.especialesDesconocidos > 0) {
      player.puedeAlcanzarLider = null;
      player.eliminadoMatematicamente = false;
      return;
    }

    player.puedeAlcanzarLider =
      player.techoPuntos >= leaderPoints;
    player.eliminadoMatematicamente =
      !player.puedeAlcanzarLider;
  });

  return sortedRanking;
}
