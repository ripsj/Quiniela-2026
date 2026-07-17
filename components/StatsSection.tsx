"use client";

import {
  ChevronDown,
} from "lucide-react";
import {
  KeyboardEvent,
  MouseEvent,
  useState,
} from "react";
import StatTooltip from "./StatTooltip";
import type {
  BestDayStat,
  ExactosStat,
  LoneWolfStat,
  StreakStat,
} from "@/lib/stats";
import { formatDateKeyForDisplay } from "@/lib/matchDay";

type StatWithTop5<T> = T & {
  top5: T[];
};

interface TopRow {
  name: string;
  value: string;
  detail?: string;
}

interface CardConfig {
  id: string;
  title: string;
  tooltip: string;
  winner?: string;
  summary?: string;
  detail?: string;
  topRows: TopRow[];
}

interface Props {
  stats: {
    masExactos?: StatWithTop5<ExactosStat>;
    mejorRacha?: StatWithTop5<StreakStat>;
    mejorJornada?: StatWithTop5<BestDayStat>;
    loboSolitario?: StatWithTop5<LoneWolfStat>;
  };
}

function stopCardClick(
  event: MouseEvent
) {
  event.stopPropagation();
}

function topRows<T>(
  items: T[] | undefined,
  mapItem: (item: T) => TopRow
) {
  return (items ?? []).map(mapItem);
}

export default function StatsSection({
  stats,
}: Props) {
  const [openCard, setOpenCard] =
    useState<string | null>(null);

  const cards: CardConfig[] = [
    {
      id: "exactos",
      title: "🎯 Más marcadores exactos",
      tooltip:
        "Cantidad de marcadores exactos acertados durante el torneo.",
      winner: stats.masExactos?.nombre,
      summary: `${stats.masExactos?.exactos ?? 0} exactos`,
      topRows: topRows(
        stats.masExactos?.top5,
        (item) => ({
          name: item.nombre,
          value: `${item.exactos} exactos`,
          detail: `${item.puntos} pts`,
        })
      ),
    },
    {
      id: "racha",
      title: "🔥 Mejor racha",
      tooltip:
        "Mayor cantidad de partidos consecutivos acertando el ganador o empate durante todo el torneo.",
      winner: stats.mejorRacha?.nombre,
      summary: `${stats.mejorRacha?.racha ?? 0} aciertos seguidos`,
      topRows: topRows(
        stats.mejorRacha?.top5,
        (item) => ({
          name: item.nombre,
          value: `${item.racha} seguidos`,
          detail: `${item.resultados} en total`,
        })
      ),
    },
    {
      id: "mejor-jornada",
      title: "🚀 Mejor jornada",
      tooltip:
        "Mayor puntuación conseguida por un participante en un solo día de partidos durante todo el torneo.",
      winner: stats.mejorJornada?.nombre,
      summary: `${stats.mejorJornada?.puntos ?? 0} puntos`,
      detail: stats.mejorJornada
        ? formatDateKeyForDisplay(
            stats.mejorJornada.fecha
          )
        : undefined,
      topRows: topRows(
        stats.mejorJornada?.top5,
        (item) => ({
          name: item.nombre,
          value: `${item.puntos} pts`,
          detail: `${item.exactos} exactos · ${formatDateKeyForDisplay(
            item.fecha
          )}`,
        })
      ),
    },
    {
      id: "lobo-solitario",
      title: "🐺 Lobo solitario",
      tooltip:
        "Marcadores exactos que solo una persona pronosticó correctamente en ese partido.",
      winner: stats.loboSolitario?.nombre,
      summary: `${stats.loboSolitario?.exactosUnicos ?? 0} exactos únicos`,
      detail: `${stats.loboSolitario?.exactos ?? 0} exactos totales`,
      topRows: topRows(
        stats.loboSolitario?.top5,
        (item) => ({
          name: item.nombre,
          value: `${item.exactosUnicos} únicos`,
          detail: `${item.exactos} exactos totales`,
        })
      ),
    },
  ];

  function toggleCard(id: string) {
    setOpenCard((current) =>
      current === id ? null : id
    );
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    id: string
  ) {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    event.preventDefault();
    toggleCard(id);
  }

  return (
    <div className="mt-8 mb-4">

      <h2 className="mb-4 text-2xl font-bold text-slate-900">
        🏅 Estadísticas
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const isOpen =
            openCard === card.id;

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              className="
                cursor-pointer
                rounded-xl
                bg-white/95
                p-4
                shadow-md
                border
                border-slate-200
                backdrop-blur-sm
                transition
                duration-150
                hover:-translate-y-0.5
                hover:shadow-lg
                active:scale-[0.99]
                focus:outline-none
                focus:ring-2
                focus:ring-slate-400
                focus:ring-offset-2
              "
              onClick={() =>
                toggleCard(card.id)
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  event,
                  card.id
                )
              }
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium leading-snug text-slate-500">
                  {card.title}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <div
                    onClick={stopCardClick}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <StatTooltip
                      text={card.tooltip}
                    />
                  </div>

                  <ChevronDown
                    className={`
                      h-4
                      w-4
                      text-slate-400
                      transition-transform
                      ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="mt-2 text-base font-bold leading-tight text-slate-900">
                {card.winner ?? "Sin datos"}
              </div>

              {card.summary && (
                <div className="mt-0.5 text-sm text-slate-500">
                  {card.summary}
                </div>
              )}

              {card.detail && (
                <div
                  className="text-sm text-slate-400"
                >
                  {card.detail}
                </div>
              )}

              <div
                className={`
                  grid
                  transition-[grid-template-rows,opacity,margin]
                  duration-150
                  ease-out
                  ${
                    isOpen
                      ? "mt-3 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0"
                  }
                `}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-slate-200 pt-2">
                    <div className="mb-1.5 text-xs font-semibold text-slate-400">
                      Top 5
                    </div>

                    <ol className="space-y-1">
                      {card.topRows.map(
                        (row, index) => (
                          <li
                            key={`${card.id}-${row.name}`}
                            className="
                              flex
                              items-center
                              gap-2
                              rounded-md
                              py-1
                              text-sm
                            "
                          >
                            <span
                              className="
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-100
                                text-xs
                                font-bold
                                text-slate-500
                              "
                            >
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                              {row.name}
                            </span>
                            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              {row.value}
                            </span>
                            {row.detail && (
                              <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
                                {row.detail}
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
