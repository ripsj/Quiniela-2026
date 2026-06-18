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
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left">
              #
            </th>

            <th className="p-3 text-left">
              Jugador
            </th>

            <th className="p-3 text-right">
              Pts
            </th>

            <th className="p-3 text-right">
              Res
            </th>

            <th className="p-3 text-right">
              Exact
            </th>

            <th className="p-3 text-right">
              Dif
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
                className="border-t"
              >
                <td className="p-3">
                  {index + 1}
                </td>

                <td className="p-3 font-medium">
                  {player.nombre}
                </td>

                <td className="p-3 text-right">
                  {player.puntos}
                </td>

                <td className="p-3 text-right">
                  {player.resultados}
                </td>

                <td className="p-3 text-right">
                  {player.exactos}
                </td>

                <td className="p-3 text-right text-gray-500">
                  {player.puntos -
                    leaderPoints}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}