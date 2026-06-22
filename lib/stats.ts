import {
  RankingEntry,
  Match,
  Prediction,
  Participant,
} from "./types";
import {
  getSheetDateKey,
  getYesterdayDateKey,
} from "./matchDay";

export interface ExactosStat {
  participanteId: number;
  nombre: string;
  puntos: number;
  exactos: number;
  resultados: number;
}

export interface DeltaStat {
  nombre: string;
  totalDelta: number;
  partidos: number;
}

export interface JugadorDiaStat {
  nombre: string;
  resultados: number;
  exactos: number;
  puntos: number;
}

export function buildStats(
  ranking: RankingEntry[],
  partidosJugados: number,
  matches: Match[],
  predictions: Prediction[],
  participants: Participant[]
) {

  const exactosRanking =
    [...ranking].sort((a, b) => {
      if (b.exactos !== a.exactos) {
        return b.exactos - a.exactos;
      }

      if (
        b.resultados !== a.resultados
      ) {
        return (
          b.resultados - a.resultados
        );
      }

      return b.puntos - a.puntos;
    });

  const masExactos =
    exactosRanking[0];

  const completedMatches =
    matches.filter(
      (m) =>
        m.finalizado === "TRUE"
    );

  const deltaMap = new Map<
    string,
    {
      nombre: string;
      totalDelta: number;
      partidos: number;
    }
  >();

  participants.forEach((p) => {
    deltaMap.set(
      String(p.id),
      {
        nombre: p.nombre,
        totalDelta: 0,
        partidos: 0,
      }
    );
  });

  completedMatches.forEach(
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

            const delta =
              Math.abs(
                Number(
                  match.goles_local
                ) -
                Number(
                  prediction.goles_local
                )
              ) +
              Math.abs(
                Number(
                  match.goles_visitante
                ) -
                Number(
                  prediction.goles_visitante
                )
              );

            const player =
              deltaMap.get(
                prediction.participante_id
              );

            if (!player) return;

            player.totalDelta +=
              delta;

            player.partidos += 1;
          }
        );
    }
  );

  const deltaRanking =
    [...deltaMap.values()]
      .sort(
        (a, b) =>
            a.totalDelta -
            b.totalDelta
        );

  const mejorDelta =
    deltaRanking[0];

  const yesterdayDateKey =
    getYesterdayDateKey();

  const yesterdayMatches =
    completedMatches.filter((match) => {
      const matchDate =
        match.fecha || match.dia;

      return (
        getSheetDateKey(matchDate) ===
        yesterdayDateKey
      );
    });

  const jugadorDiaMap = new Map<
    string,
    {
      nombre: string;
      resultados: number;
      exactos: number;
      puntos: number;
    }
  >();

  participants.forEach((p) => {
    jugadorDiaMap.set(
      String(p.id),
      {
        nombre: p.nombre,
        resultados: 0,
        exactos: 0,
        puntos: 0,
      }
    );
  });

  yesterdayMatches.forEach(
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
              realHome >
              realAway
                ? "H"
                : realHome <
                  realAway
                ? "A"
                : "D";

            const predResult =
              predHome >
              predAway
                ? "H"
                : predHome <
                  predAway
                ? "A"
                : "D";

            const player =
              jugadorDiaMap.get(
                prediction.participante_id
              );

            if (!player) return;

            if (
              realResult ===
              predResult
            ) {
              player.resultados++;
              player.puntos++;
            }

            if (
              realHome ===
                predHome &&
              realAway ===
                predAway
            ) {
              player.exactos++;
              player.puntos++;
            }
          }
        );
    }
  );

  const jugadorDiaRanking =
    [...jugadorDiaMap.values()]
      .sort((a, b) => {

        if (
          b.resultados !==
          a.resultados
        ) {
          return (
            b.resultados -
            a.resultados
          );
        }

        if (
          b.exactos !==
          a.exactos
        ) {
          return (
            b.exactos -
            a.exactos
          );
        }

        return (
          b.puntos -
          a.puntos
        );
      });

  const jugadorDelDia =
    yesterdayMatches.length > 0
      ? jugadorDiaRanking[0]
      : null;

  return {
    masExactos: {
      ...masExactos,
      top5:
        exactosRanking.slice(
          0,
          5
        ),
    },
    mejorDelta: {
      ...mejorDelta,
      top5:
        deltaRanking.slice(
          0,
          5
        ),
    },
    jugadorDelDia:
      jugadorDelDia == null
        ? null
        : {
            ...jugadorDelDia,
            top5:
              jugadorDiaRanking.slice(
                0,
                5
              ),
          },
  };
}
