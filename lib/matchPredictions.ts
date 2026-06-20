import {
  Match,
  Participant,
  Prediction,
} from "./types";

import { calculateMatchPoints } from "./scoring";

export interface MatchPredictionCell {
  participanteId: string;
  nombre: string;
  golesLocal: string | null;
  golesVisitante: string | null;
  puntos: number | null;
  exacto: boolean;
  resultado: boolean;
}

export interface MatchPredictionsRow {
  match: Match;
  predictions: MatchPredictionCell[];
}

function hasScore(value: string | null | undefined) {
  return value != null && value !== "";
}

function compareMatches(a: Match, b: Match) {
  const dateComparison =
    String(a.fecha ?? "").localeCompare(
      String(b.fecha ?? "")
    );

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return String(a.id).localeCompare(
    String(b.id),
    undefined,
    { numeric: true }
  );
}

export function buildMatchPredictions(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[]
): MatchPredictionsRow[] {
  const predictionsByMatchAndParticipant =
    new Map<string, Prediction>();

  predictions.forEach((prediction) => {
    predictionsByMatchAndParticipant.set(
      `${prediction.partido_id}:${prediction.participante_id}`,
      prediction
    );
  });

  return [...matches]
    .sort(compareMatches)
    .map((match) => {
      const isFinished =
        match.finalizado === "TRUE" &&
        hasScore(match.goles_local) &&
        hasScore(match.goles_visitante);

      const predictionsForMatch =
        participants.map((participant) => {
          const prediction =
            predictionsByMatchAndParticipant.get(
              `${match.id}:${participant.id}`
            );

          let puntos: number | null = null;
          let exacto = false;
          let resultado = false;

          if (
            prediction &&
            isFinished &&
            hasScore(prediction.goles_local) &&
            hasScore(prediction.goles_visitante)
          ) {
            const result =
              calculateMatchPoints(
                Number(match.goles_local),
                Number(match.goles_visitante),
                Number(prediction.goles_local),
                Number(prediction.goles_visitante)
              );

            puntos = result.points;
            exacto = result.exact;
            resultado = result.result;
          }

          return {
            participanteId: String(participant.id),
            nombre: participant.nombre,
            golesLocal:
              prediction?.goles_local ?? null,
            golesVisitante:
              prediction?.goles_visitante ?? null,
            puntos,
            exacto,
            resultado,
          };
        });

      return {
        match,
        predictions: predictionsForMatch,
      };
    });
}
