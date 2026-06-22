"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

interface Props {
  data: Record<string, string | number>[];
}

export default function RankingHistoryChart({
  data,
}: Props) {
    const [selectedPlayers, setSelectedPlayers] =
    useState<string[]>([]);

    const COLORS = [
        "#2563eb",
        "#dc2626",
        "#16a34a",
        "#ca8a04",
        "#9333ea",
    ];

    const allPlayers = data.length
    ? Object.keys(
    data[0]
    ).filter(
    (key) => key !== "partido"
    )
    : [];

    const latest =
    data[data.length - 1] ?? {};

    const topPlayers =
    [...allPlayers]
        .sort(
        (a, b) =>
            Number(latest[a]) -
            Number(latest[b])
        )
        .slice(0, 5);

    const players = selectedPlayers;

  if (!data.length) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/95
        backdrop-blur-sm p-3 shadow-lg border border-slate-200 sm:p-6">

        <h2 className="
        mb-2
        text-2xl
        font-bold
        text-slate-900
        ">
        📈 Evolución del Ranking
        </h2>

        <p className="
        mb-6
        text-slate-500
        ">
        Posición después de cada partido
        </p>

        <div className="mb-6">

        <label className="
            mb-2
            block
            text-sm
            font-medium
            text-slate-700
        ">
            Participantes
        </label>
        <select
            className="
            mb-4
            w-full
            rounded-xl
            border
            border-slate-300
            p-3
            "
            onChange={(e) => {

            const player =
                e.target.value;

            if (
                player &&
                !selectedPlayers.includes(
                player
                )
            ) {
                setSelectedPlayers([
                ...selectedPlayers,
                player,
                ]);
            }
            }}
        >

            <option value="">
            Selecciona un participante
            </option>

            {allPlayers
            .map(
                (player) => (
                <option
                key={player}
                value={player}
                >
                {player}
                </option>
            )
            )}

        </select>
        <div className="mb-4">

        <div className="mb-3 flex flex-wrap gap-2">

            {selectedPlayers.map(
            (player) => (

                <button
                key={player}
                className="
                    rounded-full
                    bg-blue-100
                    px-3
                    py-1
                    text-sm
                "
                onClick={() =>
                    setSelectedPlayers(
                    selectedPlayers.filter(
                        (p) =>
                        p !== player
                    )
                    )
                }
                >
                {player} ✕
                </button>

            )
            )}

        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="
            rounded-xl
            bg-blue-100
            px-4
            py-2
            text-sm
            font-semibold
            text-blue-700
            hover:bg-blue-200
            "
            onClick={() =>
            setSelectedPlayers(topPlayers)
            }
          >
            Top 5
          </button>

          <button
            className="
            rounded-xl
            bg-slate-100
            px-4
            py-2
            text-sm
            font-semibold
            text-slate-700
            hover:bg-slate-200
            "
            onClick={() =>
            setSelectedPlayers([])
            }
          >
            Limpiar
          </button>
        </div>

        </div>

        </div>
      <div className="h-[500px] min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
        >
          <LineChart
            data={data}
            margin={{
              top: 8,
              right: 12,
              left: -18,
              bottom: 8,
            }}
          >

            <XAxis
              dataKey="partido"
            />

            <YAxis
              reversed
              allowDecimals={false}
              width={28}
            />

            <Tooltip
            formatter={(value) => [
                `Posición ${value}`,
                "",
            ]}
            />

            <Legend />

            {players.map(
                (
                    player,
                    index
                ) => (
                <Line
                    stroke={
                        COLORS[
                        index %
                        COLORS.length
                        ]
                    }
                    key={player}
                    type="monotone"
                    dataKey={player}
                    strokeWidth={4}
                    dot
                />
              )
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
