"use client";

import {
  SpecialPredictionCategory,
  SpecialPredictionPlayer,
} from "@/lib/specialPredictions";
import { Scorer } from "@/lib/types";
import { useState } from "react";

interface Props {
  categories: SpecialPredictionCategory[];
  scorers: Scorer[];
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

  return "bg-slate-100 text-slate-600";
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
      bar: "from-amber-400 to-yellow-500",
      glow: "shadow-amber-100",
    };
  }

  if (hasAlive) {
    return {
      border: "border-emerald-300",
      bar: "from-emerald-400 to-teal-500",
      glow: "shadow-emerald-100",
    };
  }

  if (allEliminated) {
    return {
      border: "border-red-200",
      bar: "from-red-300 to-rose-500",
      glow: "shadow-red-50",
    };
  }

  return {
    border: "border-slate-200",
    bar: "from-[#001F5B] to-[#8B1538]",
    glow: "shadow-slate-100",
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

  return "pendiente";
}

function SpecialCategoryCard({
  item,
}: {
  item: SpecialPredictionCategory;
}) {
  const maxCount =
    item.groups[0]?.players.length ?? 0;

  return (
    <article
      className="
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
          <div>
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
          </div>

          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            {item.groups.length} opciones
          </span>
        </div>
      </div>

      {item.groups.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">
          Sin predicciones capturadas.
        </p>
      ) : (
        <div className="space-y-4 p-5 text-slate-900">
          {item.groups.map((group) => {
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
                  bg-white
                  p-3
                  shadow-md
                  ${tone.border}
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
                  <span className="text-lg font-extrabold text-slate-900">
                    {group.players.length}
                  </span>
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
  const topScorers = scorers
    .filter((scorer) => scorer.jugador)
    .slice(0, 10);
  const activeCategory =
    categories.find(
      (item) =>
        item.category.key ===
        activeCategoryKey
    );
  const showScorers =
    activeCategory?.category.key ===
    "goleador";

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Predicciones especiales
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Agrupadas por categoría y cantidad de jugadores.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Categorías especiales"
        className="
          mb-4
          flex
          gap-2
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
            ? "grid gap-4 xl:grid-cols-2"
            : ""
        }
      >
        {showScorers && (
          <div
            className="
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
              <div className="overflow-x-auto text-slate-900">
                <table className="min-w-[620px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="p-3 text-center">
                        #
                      </th>
                      <th className="p-3 text-left">
                        Jugador
                      </th>
                      <th className="p-3 text-left">
                        Equipo
                      </th>
                      <th className="p-3 text-right">
                        Goles
                      </th>
                      <th className="p-3 text-right">
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
                          <td className="p-3 text-center font-bold text-slate-500">
                            {scorer.posicion ||
                              index + 1}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {scorer.jugador}
                          </td>
                          <td className="p-3 text-slate-600">
                            {scorer.equipo}
                          </td>
                          <td className="p-3 text-right text-lg font-extrabold text-[#8B1538]">
                            {scorer.goles}
                          </td>
                          <td className="p-3 text-right text-slate-600">
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
          />
        )}
      </div>
    </section>
  );
}
