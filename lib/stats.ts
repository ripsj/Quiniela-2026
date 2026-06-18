import {
  RankingEntry,
  Match,
  Prediction,
  Participant,
} from "./types";

export function buildStats(
  ranking: RankingEntry[],
  partidosJugados: number,
  matches: Match[],
  predictions: Prediction[],
  participants: Participant[]
) {

  const masExactos =
    [...ranking].sort(
      (a, b) =>
        b.exactos - a.exactos
    )[0];

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

  const mejorDelta =
    [...deltaMap.values()]
      .sort(
        (a, b) =>
            a.totalDelta -
            b.totalDelta
        )[0];

  const ultimoDia =
    completedMatches
      .map((m: any) => m.dia)
      .filter(Boolean)
      .sort()
      .pop();

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

  completedMatches
    .filter(
      (m: any) =>
        m.dia === ultimoDia
    )
    .forEach(
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

  const jugadorDelDia =
    [...jugadorDiaMap.values()]
      .sort(
        (a, b) => {

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
        }
      )[0];

  return {
    masExactos,
    mejorDelta,
    jugadorDelDia,
  };
}