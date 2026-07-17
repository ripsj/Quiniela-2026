import {
  Match,
  Participant,
  Prediction,
  SpecialPrediction,
} from "./types";

import { calculateMatchPoints } from "./scoring";
import { buildResolvedSpecialPointEvents } from "./specialPredictions";

type PointsHistoryRow = Record<
  string,
  string | number
>;

type Jornada = {
  value: string;
  label: string;
  order: number;
};

function normalizeJornada(
  value: string | undefined
) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  const match = text.match(/(\d+)/);
  const number = match?.[1];

  if (!number) {
    return null;
  }

  return {
    value: `jornada-${number}`,
    label: `Jornada ${number}`,
    order: Number(number),
  };
}

function buildJornadaIndex(
  matches: Match[]
) {
  const explicit =
    new Map<string, Jornada>();
  const grouped =
    new Map<string, Match[]>();

  matches.forEach((match) => {
    const jornada =
      normalizeJornada(match.jornada);

    if (jornada) {
      explicit.set(match.id, jornada);
      return;
    }

    const groupKey = String(
      match.grupo || ""
    ).trim();

    if (!groupKey) {
      return;
    }

    const groupMatches =
      grouped.get(groupKey) ?? [];

    groupMatches.push(match);
    grouped.set(groupKey, groupMatches);
  });

  grouped.forEach((groupMatches) => {
    groupMatches
      .sort((a, b) => {
        const dateComparison =
          String(
            a.fecha ?? ""
          ).localeCompare(
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
      })
      .forEach((match, index) => {
        const number =
          Math.floor(index / 2) + 1;

        if (number > 3) {
          return;
        }

        explicit.set(match.id, {
          value: `jornada-${number}`,
          label: `Jornada ${number}`,
          order: number,
        });
      });
  });

  return explicit;
}

function buildSnapshotRow(
  label: string,
  participants: Participant[],
  scores: Map<string, number>
) {
  const row: PointsHistoryRow = {
    partido: label,
  };

  participants.forEach(
    (participant) => {
      row[participant.nombre] =
        scores.get(
          String(participant.id)
        ) ?? 0;
    }
  );

  return row;
}

export function buildPointsHistory(
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

  const jornadaIndex =
    buildJornadaIndex(matches);

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

  const applyMatchPoints = (
    match: Match
  ) => {
    predictions
      .filter(
        (p) =>
          Number(p.partido_id) ===
          Number(match.id)
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
          current + result.points
        );
      });
  };

  const jornadas = [
    ...new Map(
      [...jornadaIndex.values()]
        .sort(
          (a, b) =>
            a.order - b.order
        )
        .map((jornada) => [
          jornada.value,
          jornada,
        ])
    ).values(),
  ];

  jornadas.forEach((jornada) => {
    const jornadaMatches =
      completedMatches.filter(
        (match) =>
          jornadaIndex.get(match.id)
            ?.value === jornada.value
      );

    if (!jornadaMatches.length) {
      return;
    }

    jornadaMatches.forEach(
      applyMatchPoints
    );

    history.push(
      buildSnapshotRow(
        jornada.label,
        participants,
        scores
      )
    );
  });

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

    history.push(
      buildSnapshotRow(
        event.label,
        participants,
        scores
      )
    );
  });

  return history;
}
