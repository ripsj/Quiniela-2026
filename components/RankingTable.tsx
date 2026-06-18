import { RankingEntry } from "@/lib/types";

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
        overflow-hidden
        rounded-2xl
        bg-white/95
        backdrop-blur-sm
        shadow-lg
        border
        border-slate-200
      "
    >
      <table className="w-full">
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
              Pts
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
            (player, index) => (
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
                <td className="p-4 text-center font-bold">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && index + 1}
                </td>

                <td className="p-4 font-semibold text-slate-900">
                  {player.nombre}
                </td>

                <td className="p-4 text-right font-bold text-slate-900">
                  {player.puntos}
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
                <td className="p-4 text-center">
                  {player.forma?.join(" ")}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}