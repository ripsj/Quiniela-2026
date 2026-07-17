import {
  Participant,
  SpecialPrediction,
} from "./types";
import { resolveSpecialAlias } from "./specialAliases";

export interface SpecialCategory {
  key: string;
  label: string;
  points: number;
  aliases?: string[];
}

export interface SpecialPredictionPlayer {
  participanteId: string;
  nombre: string;
  status: "alive" | "eliminated" | "hit" | "unknown";
}

export interface SpecialPredictionGroup {
  value: string;
  variants: string[];
  players: SpecialPredictionPlayer[];
}

export interface SpecialPredictionCategory {
  category: SpecialCategory;
  result: string | null;
  liveOptions: string[];
  groups: SpecialPredictionGroup[];
}

export interface SpecialPointSummary {
  confirmed: number;
  possible: number;
  unknown: number;
}

export const SPECIAL_CATEGORIES: SpecialCategory[] = [
  {
    key: "campeon",
    label: "Campeón",
    points: 15,
  },
  {
    key: "subcampeon",
    label: "Subcampeón",
    points: 10,
  },
  {
    key: "tercer_lugar",
    label: "Tercer lugar",
    points: 5,
    aliases: [
      "3er_lugar",
      "3er lugar",
      "tercer lugar",
      "tercer puesto",
      "tercero",
    ],
  },
  {
    key: "fase_mexico",
    label: "Fase de México",
    points: 7,
    aliases: [
      "fase mexico",
      "fase méxico",
      "fase_de_mexico",
      "fase_de_méxico",
      "fase de mexico",
      "fase de méxico",
      "mexico",
      "méxico",
    ],
  },
  {
    key: "mvp",
    label: "MVP",
    points: 3,
    aliases: [
      "MVP",
      "mejor_jugador",
      "mejor jugador",
      "jugador_mvp",
      "jugador mvp",
    ],
  },
  {
    key: "goleador",
    label: "Goleador",
    points: 3,
  },
];

function normalizeValue(value: string | undefined) {
  return String(value ?? "").trim();
}

function normalizeStatus(value: string | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSpecialValue(
  prediction: SpecialPrediction,
  category: SpecialCategory
) {
  const keys = [
    category.key,
    ...(category.aliases ?? []),
  ];

  for (const key of keys) {
    const value =
      getPredictionField(
        prediction,
        key
      );

    if (normalizeValue(value)) {
      return value;
    }
  }

  return undefined;
}

function getPredictionField(
  prediction: SpecialPrediction,
  field: string
) {
  const target =
    normalizeFieldName(field);
  const entry = Object.entries(
    prediction
  ).find(
    ([key]) =>
      normalizeFieldName(key) === target
  );

  return entry?.[1];
}

function normalizeFieldName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getPlayerName(
  prediction: SpecialPrediction,
  participantsById: Map<string, Participant>
) {
  const participant =
    participantsById.get(
      String(prediction.participante_id)
    );

  return (
    participant?.nombre ||
    prediction.participante ||
    `Participante ${prediction.participante_id}`
  );
}

function getPredictionStatus(
  prediction: SpecialPrediction,
  categoryKey: string,
  predictionValue: string,
  resultValue: string | null,
  liveOptions: string[]
): SpecialPredictionPlayer["status"] {
  if (resultValue) {
    const predictionAlias =
      resolveSpecialAlias(predictionValue);
    const resultAlias =
      resolveSpecialAlias(resultValue);

    return predictionAlias.canonical ===
      resultAlias.canonical
      ? "hit"
      : "eliminated";
  }

  if (liveOptions.length > 0) {
    const predictionAlias =
      resolveSpecialAlias(predictionValue);

    return liveOptions.includes(
      predictionAlias.canonical
    )
      ? "alive"
      : "eliminated";
  }

  const raw =
    getPredictionField(
      prediction,
      `${categoryKey}_estado`
    ) ??
    getPredictionField(
      prediction,
      `${categoryKey}_status`
    ) ??
    getPredictionField(
      prediction,
      `${categoryKey}_vivo`
    );
  const status =
    normalizeStatus(raw);

  if (
    [
      "acertado",
      "correcto",
      "hit",
      "ganado",
      "winner",
    ].includes(status)
  ) {
    return "hit";
  }

  if (
    [
      "eliminado",
      "eliminada",
      "fuera",
      "false",
      "no",
      "0",
      "perdido",
    ].includes(status)
  ) {
    return "eliminated";
  }

  if (
    [
      "vivo",
      "viva",
      "true",
      "si",
      "1",
      "pendiente",
      "en juego",
    ].includes(status)
  ) {
    return "alive";
  }

  return "unknown";
}

function getCategoryResult(
  predictions: SpecialPrediction[],
  category: SpecialCategory
) {
  const keys = [
    `${category.key}_resultado`,
    `${category.key}_ganador`,
    `${category.key}_real`,
    `${category.key}_oficial`,
    ...(category.aliases ?? []).flatMap(
      (alias) => [
        `${alias}_resultado`,
        `${alias}_ganador`,
        `${alias}_real`,
        `${alias}_oficial`,
      ]
    ),
  ];

  for (const prediction of predictions) {
    for (const key of keys) {
      const value =
        normalizeValue(
          getPredictionField(
            prediction,
            key
          )
        );

      if (value) {
        if (
          [
            "pendiente",
            "por definir",
            "por decidir",
            "en juego",
            "tbd",
          ].includes(normalizeStatus(value))
        ) {
          continue;
        }

        if (/[|;,\n]/.test(value)) {
          continue;
        }

        return resolveSpecialAlias(value)
          .canonical;
      }
    }
  }

  return null;
}

function getCategoryLiveOptions(
  predictions: SpecialPrediction[],
  category: SpecialCategory
) {
  const keys = [
    `${category.key}_opciones_vivas`,
    `${category.key}_vivos`,
    `${category.key}_vivas`,
    ...(category.aliases ?? []).flatMap(
      (alias) => [
        `${alias}_opciones_vivas`,
        `${alias}_vivos`,
        `${alias}_vivas`,
      ]
    ),
  ];

  for (const prediction of predictions) {
    for (const key of keys) {
      const value = normalizeValue(
        getPredictionField(prediction, key)
      );

      if (value) {
        return [
          ...new Set(
            value
              .split(/[|;,\n]+/)
              .map((option) => option.trim())
              .filter(Boolean)
              .map(
                (option) =>
                  resolveSpecialAlias(option)
                    .canonical
              )
          ),
        ];
      }
    }
  }

  const provisionalResultKeys = [
    `${category.key}_resultado`,
    `${category.key}_ganador`,
    `${category.key}_real`,
    `${category.key}_oficial`,
    ...(category.aliases ?? []).flatMap(
      (alias) => [
        `${alias}_resultado`,
        `${alias}_ganador`,
        `${alias}_real`,
        `${alias}_oficial`,
      ]
    ),
  ];

  for (const prediction of predictions) {
    for (const key of provisionalResultKeys) {
      const value = normalizeValue(
        getPredictionField(prediction, key)
      );
      const options = value
        .split(/[|;,\n]+/)
        .map((option) => option.trim())
        .filter(Boolean);

      if (options.length > 1) {
        return [
          ...new Set(
            options.map(
              (option) =>
                resolveSpecialAlias(option)
                  .canonical
            )
          ),
        ];
      }
    }
  }

  return [];
}

export function buildSpecialPredictions(
  participants: Participant[],
  predictions: SpecialPrediction[]
): SpecialPredictionCategory[] {
  const participantsById =
    new Map<string, Participant>();

  participants.forEach((participant) => {
    participantsById.set(
      String(participant.id),
      participant
    );
  });

  return SPECIAL_CATEGORIES.map((category) => {
    const result =
      getCategoryResult(
        predictions,
        category
      );
    const liveOptions =
      getCategoryLiveOptions(
        predictions,
        category
      );
    const groups =
      new Map<
        string,
        SpecialPredictionPlayer[]
      >();

    predictions.forEach((prediction) => {
      const rawValue =
        normalizeValue(
          getSpecialValue(
            prediction,
            category
          )
        );

      if (!rawValue) {
        return;
      }

      const alias =
        resolveSpecialAlias(rawValue);
      const players =
        groups.get(alias.canonical) ?? [];

      players.push({
        participanteId: String(
          prediction.participante_id
        ),
        nombre: getPlayerName(
          prediction,
          participantsById
        ),
        status: getPredictionStatus(
          prediction,
          category.key,
          rawValue,
          result,
          liveOptions
        ),
      });

      groups.set(alias.canonical, players);
    });

    return {
      category,
      result,
      liveOptions,
      groups: [...groups.entries()]
        .map(([value, players]) => {
          const variants =
            predictions
              .map((prediction) =>
                normalizeValue(
                  getSpecialValue(
                    prediction,
                    category
                  )
                )
              )
              .filter(Boolean)
              .filter(
                (variant) =>
                  resolveSpecialAlias(variant)
                    .canonical === value
              );

          return {
            value,
            variants: [
              ...new Set(variants),
            ].filter(
              (variant) =>
                variant !== value
            ),
            players,
          };
        })
        .sort(
          (a, b) =>
            b.players.length -
              a.players.length ||
            a.value.localeCompare(b.value)
        ),
    };
  });
}

export function buildSpecialPointSummaries(
  participants: Participant[],
  predictions: SpecialPrediction[]
): Map<string, SpecialPointSummary> {
  const summaries = new Map<
    string,
    SpecialPointSummary
  >();

  participants.forEach((participant) => {
    summaries.set(
      String(participant.id),
      {
        confirmed: 0,
        possible: 0,
        unknown: 0,
      }
    );
  });

  buildSpecialPredictions(
    participants,
    predictions
  ).forEach((category) => {
    const statuses = new Map<
      string,
      SpecialPredictionPlayer["status"]
    >();
    const statusPriority: Record<
      SpecialPredictionPlayer["status"],
      number
    > = {
      hit: 3,
      alive: 2,
      eliminated: 1,
      unknown: 0,
    };

    category.groups.forEach((group) => {
      group.players.forEach((player) => {
        const currentStatus = statuses.get(
          player.participanteId
        );

        if (
          currentStatus == null ||
          statusPriority[player.status] >
            statusPriority[currentStatus]
        ) {
          statuses.set(
            player.participanteId,
            player.status
          );
        }
      });
    });

    statuses.forEach((status, participantId) => {
      const summary = summaries.get(
        participantId
      );

      if (!summary) {
        return;
      }

      if (status === "hit") {
        summary.confirmed +=
          category.category.points;
      } else if (status === "alive") {
        summary.possible +=
          category.category.points;
      } else if (status === "unknown") {
        summary.unknown += 1;
      }
    });
  });

  return summaries;
}

export function getOpenSpecialPoints(
  categories: SpecialPredictionCategory[]
) {
  return categories.reduce(
    (total, category) =>
      category.groups.some((group) =>
        group.players.some(
          (player) =>
            player.status === "alive"
        )
      )
        ? total + category.category.points
        : total,
    0
  );
}
