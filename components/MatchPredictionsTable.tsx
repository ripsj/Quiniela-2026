"use client";

import {
  MatchPredictionCell,
  MatchPredictionsRow,
} from "@/lib/matchPredictions";
import {
  getSheetDateKey,
  getTodayDateKey,
} from "@/lib/matchDay";
import { useState } from "react";

interface Props {
  rows: MatchPredictionsRow[];
}

function formatPrediction(
  golesLocal: string | null | undefined,
  golesVisitante: string | null | undefined
) {
  if (
    golesLocal == null ||
    golesVisitante == null ||
    golesLocal === "" ||
    golesVisitante === ""
  ) {
    return "-";
  }

  return `${golesLocal}-${golesVisitante}`;
}

function getCellTone(
  prediction: MatchPredictionCell | undefined
) {
  if (prediction?.puntos == null) {
    return "";
  }

  if (prediction.exacto) {
    return "bg-amber-50";
  }

  if (prediction.resultado) {
    return "bg-emerald-50";
  }

  if (prediction.puntos === 0) {
    return "bg-red-50";
  }

  return "";
}

function getPointsTone(
  prediction: MatchPredictionCell
) {
  if (prediction.exacto) {
    return "bg-amber-100 text-amber-700";
  }

  if (prediction.resultado) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (prediction.puntos === 0) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-500";
}

function formatRank(index: number) {
  if (index === 0) {
    return "🥇";
  }

  if (index === 1) {
    return "🥈";
  }

  if (index === 2) {
    return "🥉";
  }

  return index + 1;
}

function normalizeJornada(
  value: string | undefined
) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  const match =
    text.match(/(\d+)/);
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
  rows: MatchPredictionsRow[]
) {
  const explicit =
    new Map<
      string,
      {
        value: string;
        label: string;
        order: number;
      }
    >();
  const grouped =
    new Map<string, MatchPredictionsRow[]>();

  rows.forEach((row) => {
    const jornada =
      normalizeJornada(
        row.match.jornada
      );

    if (jornada) {
      explicit.set(row.match.id, jornada);
      return;
    }

    const groupKey = String(
      row.match.grupo || ""
    ).trim();

    if (!groupKey) {
      return;
    }

    const groupRows =
      grouped.get(groupKey) ?? [];

    groupRows.push(row);
    grouped.set(groupKey, groupRows);
  });

  grouped.forEach((groupRows) => {
    groupRows
      .sort((a, b) => {
        const dateComparison =
          String(
            a.match.fecha ?? ""
          ).localeCompare(
            String(
              b.match.fecha ?? ""
            )
          );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return String(
          a.match.id
        ).localeCompare(
          String(b.match.id),
          undefined,
          { numeric: true }
        );
      })
      .forEach((row, index) => {
        const number =
          Math.floor(index / 2) + 1;

        if (number > 3) {
          return;
        }

        explicit.set(row.match.id, {
          value: `jornada-${number}`,
          label: `Jornada ${number}`,
          order: number,
        });
      });
  });

  return explicit;
}

export default function MatchPredictionsTable({
  rows,
}: Props) {
  const [selectedScope, setSelectedScope] =
    useState("today");
  const todayDateKey =
    getTodayDateKey();
  const jornadaIndex =
    buildJornadaIndex(rows);
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
  const visibleRows =
    selectedScope === "today"
      ? rows.filter((row) => {
          const matchDate =
            row.match.fecha ||
            row.match.dia;

          return (
            getSheetDateKey(matchDate) ===
            todayDateKey
          );
        })
      : rows.filter(
          (row) =>
            jornadaIndex.get(
              row.match.id
            )?.value === selectedScope
        );
  const participants =
    rows[0]?.predictions ?? [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Todos los partidos y predicciones
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Por defecto se muestran los partidos de hoy. Cambia entre jornadas de fase de grupos para revisar otros partidos.
        </p>
      </div>

      <div
        className="
          mb-4
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-white/95
          p-3
          shadow-lg
          backdrop-blur-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            inline-flex
            rounded-lg
            bg-slate-100
            p-1
          "
        >
          <button
            type="button"
            onClick={() =>
              setSelectedScope("today")
            }
            className={`
              min-h-10
              rounded-md
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${
                selectedScope === "today"
                  ? "bg-[#001F5B] text-white shadow"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }
            `}
          >
            Hoy
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 sm:min-w-64">
          Jornada
          <select
            value={
              selectedScope === "today"
                ? ""
                : selectedScope
            }
            onChange={(event) =>
              setSelectedScope(
                event.target.value ||
                  "today"
              )
            }
            className="
              rounded-xl
              border
              border-slate-300
              bg-white
              p-3
              text-slate-900
            "
          >
            <option value="">
              Selecciona jornada
            </option>
            {jornadas.map((jornada) => (
              <option
                key={jornada.value}
                value={jornada.value}
              >
                {jornada.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleRows.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white/95
            p-5
            text-sm
            text-slate-500
            shadow-lg
            backdrop-blur-sm
          "
        >
          No hay partidos para esta selección.
        </div>
      ) : (
      <div
        className="
          overflow-x-auto
          scroll-smooth
          rounded-2xl
          border
          border-white/20
          bg-white/95
          shadow-lg
          backdrop-blur-sm
        "
      >
        <table className="min-w-[1200px] w-full">
          <thead className="sticky top-0 z-30">
            <tr
              className="
                bg-gradient-to-r
                from-[#001F5B]
                to-[#8B1538]
                text-white
              "
            >
              <th className="sticky left-0 top-0 z-50 w-12 min-w-12 max-w-12 bg-[#001F5B] px-2 py-4 text-center sm:w-16 sm:min-w-16 sm:max-w-16 sm:p-4">
                #
              </th>
              <th className="sticky left-12 top-0 z-50 w-32 min-w-32 max-w-32 bg-[#001F5B] px-3 py-4 text-left sm:left-16 sm:w-48 sm:min-w-48 sm:max-w-48 sm:p-4 md:w-56 md:min-w-56 md:max-w-56">
                Jugador
              </th>
              {visibleRows.map((row) => {
                const isFinished =
                  row.match.finalizado === "TRUE";
                const finalScore =
                  formatPrediction(
                    row.match.goles_local,
                    row.match.goles_visitante
                  );

                return (
                  <th
                    key={row.match.id}
                    className="sticky top-0 z-30 min-w-40 bg-[#4B1C4A] p-3 text-center align-top"
                  >
                    <div className="text-sm font-bold leading-snug">
                      {row.match.equipo_local}
                    </div>
                    <div className="text-xs font-medium text-white/75">
                      vs
                    </div>
                    <div className="text-sm font-bold leading-snug">
                      {row.match.equipo_visitante}
                    </div>
                    <div className="mt-2 text-xs font-medium text-white/80">
                      {row.match.fecha ||
                        row.match.dia ||
                        "-"}
                    </div>
                    <div className="mt-1 text-xs font-bold text-white">
                      {isFinished
                        ? finalScore
                        : "Pendiente"}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {participants.map(
              (participant, index) => (
                <tr
                  key={
                    participant.participanteId
                  }
                  className="
                    group
                    border-t
                    border-slate-200
                    transition
                    hover:bg-slate-50
                  "
                >
                  <td
                    className="
                      sticky
                      left-0
                      z-20
                      w-12
                      min-w-12
                      max-w-12
                      bg-white
                      px-2
                      py-4
                      text-center
                      font-bold
                      transition
                      group-hover:bg-slate-50
                      sm:w-16
                      sm:min-w-16
                      sm:max-w-16
                      sm:p-4
                    "
                  >
                    {formatRank(index)}
                  </td>

                  <td
                    className="
                      sticky
                      left-12
                      z-20
                      w-32
                      min-w-32
                      max-w-32
                      bg-white
                      px-3
                      py-4
                      font-semibold
                      text-slate-900
                      transition
                      group-hover:bg-slate-50
                      sm:left-16
                      sm:w-48
                      sm:min-w-48
                      sm:max-w-48
                      sm:p-4
                      md:w-56
                      md:min-w-56
                      md:max-w-56
                    "
                  >
                    <div className="truncate">
                      {participant.nombre}
                    </div>
                  </td>

                  {visibleRows.map((row) => {
                    const prediction =
                      row.predictions.find(
                        (item) =>
                          item.participanteId ===
                          participant.participanteId
                      );

                    return (
                      <td
                        key={row.match.id}
                        className={`
                          p-3
                          text-center
                          transition
                          ${getCellTone(prediction)}
                        `}
                      >
                        <div className="font-semibold text-slate-900">
                          {formatPrediction(
                            prediction?.golesLocal,
                            prediction?.golesVisitante
                          )}
                        </div>
                        {prediction?.puntos != null && (
                          <div
                            className={`
                              mt-1
                              inline-flex
                              rounded-full
                              px-2
                              py-0.5
                              text-xs
                              font-bold
                              ${getPointsTone(prediction)}
                            `}
                          >
                            {prediction.puntos} pts
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
