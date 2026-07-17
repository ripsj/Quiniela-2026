"use client";

import {
  SpecialPredictionCategory,
  SpecialPredictionPlayer,
  getOpenSpecialPoints,
} from "@/lib/specialPredictions";
import { Scorer } from "@/lib/types";
import { useState } from "react";

interface Props {
  categories: SpecialPredictionCategory[];
  scorers: Scorer[];
}

interface ParticipantSpecialPrediction {
  categoryKey: string;
  categoryLabel: string;
  points: number;
  value: string;
  status: SpecialPredictionPlayer["status"];
}

interface ParticipantSpecialSummary {
  participantId: string;
  name: string;
  predictions: ParticipantSpecialPrediction[];
}

function getStatusTone(
  status: SpecialPredictionPlayer["status"]
) {
  if (status === "hit") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "alive") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "eliminated") {
    return "bg-red-100 text-red-700 line-through";
  }

  return "bg-amber-100 text-amber-800 ring-1 ring-amber-300";
}

function getGroupTone(
  players: SpecialPredictionPlayer[]
) {
  const hasHit = players.some(
    (player) => player.status === "hit"
  );
  const hasAlive = players.some(
    (player) => player.status === "alive"
  );
  const allEliminated =
    players.length > 0 &&
    players.every(
      (player) =>
        player.status === "eliminated"
    );

  if (hasHit) {
    return {
      border: "border-amber-300",
      background: "bg-amber-50",
      bar: "from-amber-400 to-yellow-500",
      glow: "shadow-amber-100",
      label: "Acertado",
      labelTone: "bg-amber-100 text-amber-800",
    };
  }

  if (hasAlive) {
    return {
      border: "border-emerald-300",
      background: "bg-emerald-50",
      bar: "from-emerald-400 to-teal-500",
      glow: "shadow-emerald-100",
      label: "Vivo",
      labelTone: "bg-emerald-100 text-emerald-800",
    };
  }

  if (allEliminated) {
    return {
      border: "border-red-200",
      background: "bg-red-50/70",
      bar: "from-red-300 to-rose-500",
      glow: "shadow-red-50",
      label: "Fuera",
      labelTone: "bg-red-100 text-red-700",
    };
  }

  return {
    border: "border-amber-300",
    background: "bg-amber-50/70",
    bar: "from-amber-300 to-orange-400",
    glow: "shadow-amber-100",
    label: "Por revisar",
    labelTone: "bg-amber-100 text-amber-800",
  };
}

function getStatusLabel(
  status: SpecialPredictionPlayer["status"]
) {
  if (status === "hit") {
    return "acertado";
  }

  if (status === "alive") {
    return "vivo";
  }

  if (status === "eliminated") {
    return "fuera";
  }

  return "por revisar";
}

function buildParticipantSummaries(
  categories: SpecialPredictionCategory[]
): ParticipantSpecialSummary[] {
  const participants = new Map<
    string,
    ParticipantSpecialSummary
  >();

  categories.forEach((category) => {
    category.groups.forEach((group) => {
      group.players.forEach((player) => {
        const summary = participants.get(
          player.participanteId
        ) ?? {
          participantId: player.participanteId,
          name: player.nombre,
          predictions: [],
        };

        summary.predictions.push({
          categoryKey: category.category.key,
          categoryLabel: category.category.label,
          points: category.category.points,
          value: group.value,
          status: player.status,
        });
        participants.set(
          player.participanteId,
          summary
        );
      });
    });
  });

  return [...participants.values()].sort(
    (a, b) => {
      const possibleA = a.predictions
        .filter(
          (prediction) =>
            prediction.status === "alive"
        )
        .reduce(
          (total, prediction) =>
            total + prediction.points,
          0
        );
      const possibleB = b.predictions
        .filter(
          (prediction) =>
            prediction.status === "alive"
        )
        .reduce(
          (total, prediction) =>
            total + prediction.points,
          0
        );

      return (
        possibleB - possibleA ||
        a.name.localeCompare(b.name)
      );
    }
  );
}

function ParticipantSpecialsView({
  participants,
  showEliminated,
}: {
  participants: ParticipantSpecialSummary[];
  showEliminated: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {participants.map((participant) => {
        const visiblePredictions = showEliminated
          ? participant.predictions
          : participant.predictions.filter(
              (prediction) =>
                prediction.status !== "eliminated"
            );
        const confirmedPoints =
          participant.predictions
            .filter(
              (prediction) =>
                prediction.status === "hit"
            )
            .reduce(
              (total, prediction) =>
                total + prediction.points,
              0
            );
        const possiblePoints =
          participant.predictions
            .filter(
              (prediction) =>
                prediction.status === "alive"
            )
            .reduce(
              (total, prediction) =>
                total + prediction.points,
              0
            );
        const unknownCount =
          participant.predictions.filter(
            (prediction) =>
              prediction.status === "unknown"
          ).length;

        return (
          <article
            key={participant.participantId}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <h3 className="font-extrabold text-slate-900">
                  {participant.name}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {confirmedPoints} ganados · {possiblePoints} por ganar
                </p>
              </div>
              {unknownCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300">
                  {unknownCount} por revisar
                </span>
              )}
            </div>

            {visiblePredictions.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No tiene especiales visibles con este filtro.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visiblePredictions.map(
                  (prediction) => (
                    <li
                      key={prediction.categoryKey}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {prediction.categoryLabel} · {prediction.points} pts
                        </div>
                        <div className="truncate font-semibold text-slate-900">
                          {prediction.value}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${getStatusTone(
                          prediction.status
                        )}`}
                      >
                        {getStatusLabel(
                          prediction.status
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}

function SpecialCategoryCard({
  item,
  showEliminated,
}: {
  item: SpecialPredictionCategory;
  showEliminated: boolean;
}) {
  const visibleGroups = item.groups
    .map((group) => ({
      ...group,
      players: showEliminated
        ? group.players
        : group.players.filter(
            (player) =>
              player.status !== "eliminated"
          ),
    }))
    .filter(
      (group) => group.players.length > 0
    );
  const maxCount =
    Math.max(
      0,
      ...visibleGroups.map(
        (group) => group.players.length
      )
    );
  const liveOptionCount = item.groups.filter(
    (group) =>
      group.players.some(
        (player) => player.status === "alive"
      )
  ).length;

  return (
    <article
      className="
        min-w-0
        max-w-full
        overflow-hidden
        rounded-2xl
        border
        border-white/30
        bg-white/95
        shadow-xl
        backdrop-blur-sm
      "
    >
      <div className="bg-gradient-to-r from-[#001F5B] to-[#8B1538] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold">
              {item.category.label}
            </h3>
            <p className="text-sm font-semibold text-white/75">
              {item.category.points} pts
            </p>
            {item.result && (
              <p className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                Resultado: {item.result}
              </p>
            )}
            {!item.result &&
              item.liveOptions.length > 0 && (
                <p className="mt-2 inline-flex rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-50">
                  Siguen vivos: {item.liveOptions.join(", ")}
                </p>
              )}
          </div>

          <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            {liveOptionCount} opciones vivas
          </span>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">
          {item.groups.length === 0
            ? "Sin predicciones capturadas."
            : "No quedan opciones visibles con este filtro."}
        </p>
      ) : (
        <div className="space-y-4 p-5 text-slate-900">
          {visibleGroups.map((group) => {
            const tone =
              getGroupTone(group.players);
            const percentage =
              maxCount > 0
                ? Math.max(
                    8,
                    Math.round(
                      (group.players.length /
                        maxCount) *
                        100
                    )
                  )
                : 0;

            return (
              <div
                key={group.value}
                className={`
                  rounded-xl
                  border
                  p-3
                  shadow-md
                  ${tone.border}
                  ${tone.background}
                  ${tone.glow}
                `}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-900">
                      {group.value}
                    </div>
                    <div className="text-xs text-slate-500">
                      {group.players.length} jugadores
                    </div>
                    {group.variants.length > 0 && (
                      <div className="mt-1 truncate text-xs text-slate-400">
                        Alias: {group.variants.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${tone.labelTone}`}>
                      {tone.label}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {group.players.length}
                    </span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {group.players.map(
                    (player) => (
                      <span
                        key={
                          player.participanteId
                        }
                        title={getStatusLabel(
                          player.status
                        )}
                        className={`
                          rounded-full
                          px-2
                          py-1
                          text-xs
                          font-semibold
                          ${getStatusTone(
                            player.status
                          )}
                        `}
                      >
                        {player.nombre}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function SpecialPredictionsSection({
  categories,
  scorers,
}: Props) {
  const defaultCategory =
    categories.find(
      (item) =>
        item.category.key === "campeon"
    )?.category.key ??
    categories[0]?.category.key ??
    "";
  const [activeCategoryKey, setActiveCategoryKey] =
    useState(defaultCategory);
  const [showEliminated, setShowEliminated] =
    useState(true);
  const [view, setView] = useState<
    "category" | "participant"
  >("category");
  const topScorers = scorers
    .filter((scorer) => scorer.jugador)
    .slice(0, 10);
  const activeCategory =
    categories.find(
      (item) =>
        item.category.key ===
        activeCategoryKey
    );
  const aliveParticipantIds = new Set(
    categories.flatMap((category) =>
      category.groups.flatMap((group) =>
        group.players
          .filter(
            (player) =>
              player.status === "alive"
          )
          .map(
            (player) => player.participanteId
          )
      )
    )
  );
  const pointsInPlay =
    getOpenSpecialPoints(categories);
  const unknownPredictions = new Set(
    categories.flatMap((category) =>
      category.groups.flatMap((group) =>
        group.players
          .filter(
            (player) =>
              player.status === "unknown"
          )
          .map(
            (player) =>
              `${category.category.key}:${player.participanteId}`
          )
      )
    )
  ).size;
  const showScorers =
    activeCategory?.category.key ===
    "goleador";
  const participantSummaries =
    buildParticipantSummaries(categories);

  return (
    <section className="mt-8 min-w-0 max-w-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Predicciones especiales
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Agrupadas por categoría y cantidad de jugadores.
          </p>
        </div>

        <button
          type="button"
          aria-pressed={showEliminated}
          onClick={() =>
            setShowEliminated((current) => !current)
          }
          className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:self-auto"
        >
          {showEliminated
            ? "Ocultar eliminados"
            : "Mostrar eliminados"}
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-2xl font-extrabold text-emerald-800">
            {aliveParticipantIds.size}
          </div>
          <div className="text-sm font-semibold text-emerald-700">
            participantes con opciones vivas
          </div>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-2xl font-extrabold text-sky-800">
            {pointsInPlay}
          </div>
          <div className="text-sm font-semibold text-sky-700">
            puntos en categorías abiertas
          </div>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            unknownPredictions > 0
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`text-2xl font-extrabold ${
              unknownPredictions > 0
                ? "text-amber-800"
                : "text-slate-800"
            }`}
          >
            {unknownPredictions}
          </div>
          <div
            className={`text-sm font-semibold ${
              unknownPredictions > 0
                ? "text-amber-700"
                : "text-slate-600"
            }`}
          >
            predicciones por revisar
          </div>
        </div>
      </div>

      <div className="mb-4 flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
        <button
          type="button"
          aria-pressed={view === "category"}
          onClick={() => setView("category")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-bold transition sm:flex-none ${
            view === "category"
              ? "bg-[#001F5B] text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Por categoría
        </button>
        <button
          type="button"
          aria-pressed={view === "participant"}
          onClick={() => setView("participant")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-bold transition sm:flex-none ${
            view === "participant"
              ? "bg-[#001F5B] text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Por participante
        </button>
      </div>

      {view === "participant" ? (
        <ParticipantSpecialsView
          participants={participantSummaries}
          showEliminated={showEliminated}
        />
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Categorías especiales"
            className="
          mb-4
          flex
          gap-2
          max-w-full
          overflow-x-auto
          rounded-lg
          border
          border-white/30
          bg-white/90
          p-1
          shadow-lg
          backdrop-blur-sm
        "
          >
            {categories.map((item) => {
          const isActive =
            item.category.key ===
            activeCategoryKey;

          return (
            <button
              key={item.category.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                setActiveCategoryKey(
                  item.category.key
                )
              }
              className={`
                inline-flex
                min-h-10
                shrink-0
                items-center
                rounded-md
                px-3
                py-2
                text-sm
                font-semibold
                transition
                ${
                  isActive
                    ? "bg-[#001F5B] text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
            >
              {item.category.label}
            </button>
          );
            })}
          </div>

          <div
            className={
              showScorers
                ? "grid min-w-0 max-w-full gap-4 xl:grid-cols-2"
                : ""
            }
          >
        {showScorers && (
          <div
            className="
              min-w-0
              max-w-full
              overflow-hidden
              rounded-2xl
              border
              border-white/30
              bg-white/95
              shadow-xl
              backdrop-blur-sm
            "
          >
            <div className="bg-gradient-to-r from-[#001F5B] via-[#8B1538] to-[#001F5B] p-5 text-white">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold">
                    Tabla de goleo real
                  </h3>
                  <p className="text-sm text-white/75">
                    Actualizada desde Google Sheets
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  Top {topScorers.length}
                </span>
              </div>
            </div>

            {topScorers.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">
                Aún no hay goleadores sincronizados.
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto text-slate-900">
                <table className="w-full min-w-[360px] sm:min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="p-2 text-center sm:p-3">
                        #
                      </th>
                      <th className="p-2 text-left sm:p-3">
                        Jugador
                      </th>
                      <th className="hidden p-2 text-left sm:table-cell sm:p-3">
                        Equipo
                      </th>
                      <th className="p-2 text-right sm:p-3">
                        Goles
                      </th>
                      <th className="hidden p-2 text-right sm:table-cell sm:p-3">
                        Asist.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map(
                      (scorer, index) => (
                        <tr
                          key={`${scorer.jugador}-${scorer.equipo}`}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="p-2 text-center font-bold text-slate-500 sm:p-3">
                            {scorer.posicion ||
                              index + 1}
                          </td>
                          <td className="p-2 font-bold text-slate-900 sm:p-3">
                            <div className="max-w-40 truncate sm:max-w-none">
                              {scorer.jugador}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 sm:hidden">
                              {scorer.equipo}
                            </div>
                          </td>
                          <td className="hidden p-2 text-slate-600 sm:table-cell sm:p-3">
                            {scorer.equipo}
                          </td>
                          <td className="p-2 text-right text-lg font-extrabold text-[#8B1538] sm:p-3">
                            {scorer.goles}
                          </td>
                          <td className="hidden p-2 text-right text-slate-600 sm:table-cell sm:p-3">
                            {scorer.asistencias ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeCategory && (
          <SpecialCategoryCard
            item={activeCategory}
            showEliminated={showEliminated}
          />
        )}
          </div>
        </>
      )}
    </section>
  );
}
