import { RankingEntry } from "@/lib/types";
import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

interface Props {
  ranking: RankingEntry[];
}

export default function RankingTable({
  ranking,
}: Props) {
  const leaderPoints =
    ranking[0]?.puntos ?? 0;

  return (
    <div
      className="
      overflow-x-auto
      scroll-smooth
      rounded-2xl
      border
      border-white/20
      bg-white/95
      backdrop-blur-sm
      "
    >
      <table className="min-w-[900px] w-full">
        <thead>
          <tr className="bg-gradient-to-r
            from-[#001F5B]
            to-[#8B1538]
            text-white">
            <th className="p-4 text-left">
              #
            </th>

            <th className="p-4 text-left">
              Jugador
            </th>

            <th className="p-4 text-right">
              Total
            </th>

            <th className="p-4 text-right">
              Partidos
            </th>

            <th className="p-4 text-right">
              Especiales
            </th>

            <th className="p-4 text-right">
              Por ganar
            </th>

            <th className="p-4 text-right">
              Techo
            </th>

            <th className="p-4 text-right">
              Resultados
            </th>

            <th className="p-4 text-right">
              Exactos
            </th>

            <th className="p-4 text-right">
              Diferencia al líder
            </th>
            <th className="p-4 text-center">
              Forma
            </th>
          </tr>
        </thead>

        <tbody>
          {ranking.map(
            (player, index) => {
              const positionChange =
                player.cambioPosicion ?? 0;
              const PositionIcon =
                positionChange > 0
                  ? ArrowUp
                  : positionChange < 0
                  ? ArrowDown
                  : Minus;
              const positionLabel =
                positionChange > 0
                  ? `Subió ${positionChange}`
                  : positionChange < 0
                  ? `Bajó ${Math.abs(
                      positionChange
                    )}`
                  : "Sin cambios";

              return (
                <tr
                  key={
                    player.participanteId
                  }
                  className="
                    border-t
                    border-slate-200
                    hover:bg-slate-50
                    transition
                  "
                >
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="min-w-6 text-center font-bold">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 &&
                          index + 1}
                      </span>

                      <span
                        title={positionLabel}
                        aria-label={positionLabel}
                        className={`
                          inline-flex
                          h-6
                          min-w-6
                          items-center
                          justify-center
                          gap-0.5
                          rounded-full
                          px-1
                          text-xs
                          font-bold
                          ${
                            positionChange > 0
                              ? "bg-emerald-50 text-emerald-600"
                              : positionChange < 0
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-100 text-slate-400"
                          }
                        `}
                      >
                        <PositionIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                          strokeWidth={3}
                        />
                        {positionChange !==
                          0 && (
                          <span>
                            {Math.abs(
                              positionChange
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-slate-900">
                    {player.nombre}
                  </td>

                  <td className="p-4 text-right font-bold text-slate-900">
                    {player.puntos}
                  </td>

                  <td className="p-4 text-right text-slate-700">
                    {player.puntosPartidos}
                  </td>

                  <td className="p-4 text-right font-semibold text-[#8B1538]">
                    {player.puntosEspeciales}
                  </td>

                  <td className="p-4 text-right text-emerald-700">
                    <span className="font-semibold">
                      +{player.puntosPosibles}
                    </span>
                    {player.especialesDesconocidos > 0 && (
                      <span
                        className="ml-1 text-amber-600"
                        title={`${player.especialesDesconocidos} especiales sin estado`}
                        aria-label={`${player.especialesDesconocidos} especiales sin estado`}
                      >
                        ⚠
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right font-bold text-slate-900">
                    {player.techoPuntos}
                  </td>

                  <td className="p-4 text-right text-slate-700">
                    {player.resultados}
                  </td>

                  <td className="p-4 text-right text-slate-700">
                    {player.exactos}
                  </td>

                  <td className="p-4 text-right text-slate-500">
                    {player.puntos -
                      leaderPoints}
                  </td>
                  <td className="
                  p-3
                  text-center
                  whitespace-nowrap">
                    {player.forma?.join("")}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}
