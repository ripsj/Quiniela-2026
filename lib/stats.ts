import {
  Match,
  Participant,
  Prediction,
  RankingEntry,
} from "./types";
import { getSheetDateKey } from "./matchDay";
import { calculateMatchPoints } from "./scoring";

export interface ExactosStat {
  participanteId: number;
  nombre: string;
  puntos: number;
  exactos: number;
  resultados: number;
}

export interface StreakStat {
  nombre: string;
  racha: number;
  resultados: number;
}

export interface BestDayStat {
  nombre: string;
  fecha: string;
  puntos: number;
  exactos: number;
  resultados: number;
}

export interface ResultsStat {
  nombre: string;
  resultados: number;
  exactos: number;
  puntosPartidos: number;
}

function isCompletedMatch(match: Match) {
  return (
    match.finalizado === "TRUE" &&
    Number.isFinite(Number(match.goles_local)) &&
    Number.isFinite(Number(match.goles_visitante))
  );
}

function predictionKey(
  matchId: string,
  participantId: string
) {
  return `${matchId}:${participantId}`;
}

export function buildStats(
  ranking: RankingEntry[],
  matches: Match[],
  predictions: Prediction[],
  participants: Participant[]
) {
  const completedMatches = matches
    .filter(isCompletedMatch)
    .sort((a, b) => {
      const dateA = getSheetDateKey(
        a.fecha || a.dia
      );
      const dateB = getSheetDateKey(
        b.fecha || b.dia
      );

      return (
        dateA.localeCompare(dateB) ||
        Number(a.id) - Number(b.id)
      );
    });
  const predictionIndex = new Map(
    predictions.map((prediction) => [
      predictionKey(
        String(prediction.partido_id),
        String(prediction.participante_id)
      ),
      prediction,
    ])
  );
  const exactosRanking = [...ranking].sort(
    (a, b) =>
      b.exactos - a.exactos ||
      b.resultados - a.resultados ||
      b.puntosPartidos - a.puntosPartidos ||
      a.nombre.localeCompare(b.nombre, "es")
  );
  const resultsRanking: ResultsStat[] = [
    ...ranking,
  ]
    .map((entry) => ({
      nombre: entry.nombre,
      resultados: entry.resultados,
      exactos: entry.exactos,
      puntosPartidos: entry.puntosPartidos,
    }))
    .sort(
      (a, b) =>
        b.resultados - a.resultados ||
        b.exactos - a.exactos ||
        b.puntosPartidos - a.puntosPartidos ||
        a.nombre.localeCompare(b.nombre, "es")
    );

  const streakRanking: StreakStat[] =
    participants.map((participant) => {
      let currentStreak = 0;
      let bestStreak = 0;

      completedMatches.forEach((match) => {
        const prediction = predictionIndex.get(
          predictionKey(
            String(match.id),
            String(participant.id)
          )
        );

        if (!prediction) {
          currentStreak = 0;
          return;
        }

        const result = calculateMatchPoints(
          Number(match.goles_local),
          Number(match.goles_visitante),
          Number(prediction.goles_local),
          Number(prediction.goles_visitante)
        );

        currentStreak = result.result
          ? currentStreak + 1
          : 0;
        bestStreak = Math.max(
          bestStreak,
          currentStreak
        );
      });

      return {
        nombre: participant.nombre,
        racha: bestStreak,
        resultados:
          ranking.find(
            (entry) =>
              entry.participanteId === participant.id
          )?.resultados ?? 0,
      };
    });

  streakRanking.sort(
    (a, b) =>
      b.racha - a.racha ||
      b.resultados - a.resultados ||
      a.nombre.localeCompare(b.nombre, "es")
  );

  const bestDays = new Map<string, BestDayStat>();
  const dayPerformances = new Map<
    string,
    BestDayStat
  >();

  completedMatches.forEach((match) => {
    const dateKey = getSheetDateKey(
      match.fecha || match.dia
    );

    participants.forEach((participant) => {
      const prediction = predictionIndex.get(
        predictionKey(
          String(match.id),
          String(participant.id)
        )
      );

      if (!prediction) return;

      const result = calculateMatchPoints(
        Number(match.goles_local),
        Number(match.goles_visitante),
        Number(prediction.goles_local),
        Number(prediction.goles_visitante)
      );
      const key = `${participant.id}:${dateKey}`;
      const performance = dayPerformances.get(key) ?? {
        nombre: participant.nombre,
        fecha: dateKey,
        puntos: 0,
        exactos: 0,
        resultados: 0,
      };

      performance.puntos += result.points;
      performance.exactos += result.exact ? 1 : 0;
      performance.resultados += result.result ? 1 : 0;
      dayPerformances.set(key, performance);
    });
  });

  dayPerformances.forEach((performance, key) => {
    const participantId = key.split(":")[0];
    const currentBest = bestDays.get(participantId);

    if (
      !currentBest ||
      performance.puntos > currentBest.puntos ||
      (performance.puntos === currentBest.puntos &&
        performance.exactos > currentBest.exactos) ||
      (performance.puntos === currentBest.puntos &&
        performance.exactos === currentBest.exactos &&
        performance.fecha < currentBest.fecha)
    ) {
      bestDays.set(participantId, performance);
    }
  });

  const bestDayRanking = [...bestDays.values()].sort(
    (a, b) =>
      b.puntos - a.puntos ||
      b.exactos - a.exactos ||
      b.resultados - a.resultados ||
      a.nombre.localeCompare(b.nombre, "es")
  );

  return {
    masExactos: {
      ...exactosRanking[0],
      top5: exactosRanking.slice(0, 5),
    },
    mejorRacha: {
      ...streakRanking[0],
      top5: streakRanking.slice(0, 5),
    },
    mejorJornada: {
      ...bestDayRanking[0],
      top5: bestDayRanking.slice(0, 5),
    },
    masResultados: {
      ...resultsRanking[0],
      top5: resultsRanking.slice(0, 5),
    },
  };
}
