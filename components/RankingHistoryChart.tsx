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
    
  if (!data.length) {
    return null;
  }

    const [search, setSearch] =
    useState("");

    const COLORS = [
        "#2563eb",
        "#dc2626",
        "#16a34a",
        "#ca8a04",
        "#9333ea",
    ];

    const allPlayers = Object.keys(
    data[0]
    ).filter(
    (key) => key !== "partido"
    );

    const latest =
    data[data.length - 1];

    const topPlayers =
    [...allPlayers]
        .sort(
        (a, b) =>
            Number(latest[a]) -
            Number(latest[b])
        )
        .slice(0, 5);

    const [selectedPlayers, setSelectedPlayers] =
    useState<string[]>(topPlayers);

    const players = selectedPlayers;

  return (
    <div className="rounded-2xl bg-white/95
        backdrop-blur-sm p-6 shadow-lg border border-slate-200">

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
            .filter(
                (player) =>
                player
                    .toLowerCase()
                    .includes(
                    search.toLowerCase()
                    )
            )
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

        <button
            className="
            rounded-xl
            bg-red-100
            px-4
            py-2
            text-sm
            hover:bg-red-200
            "
            onClick={() =>
            setSelectedPlayers(topPlayers)
            }
        >
            Restaurar Top 5
        </button>

        </div>

        </div>
      <div className="h-[500px] min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
        >
          <LineChart data={data}>

            <XAxis
              dataKey="partido"
            />

            <YAxis
              reversed
              allowDecimals={false}
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