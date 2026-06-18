import { RankingEntry } from "@/lib/types";

interface Props {
  ranking: RankingEntry[];
}

export default function RankingTable({
  ranking,
}: Props) {
  return (
    <div className="rounded-xl border">
      {ranking.map((player, index) => (
        <div
          key={player.participanteId}
          className="flex justify-between border-b p-4"
        >
          <div>
            #{index + 1} {player.nombre}
          </div>

          <div className="font-bold">
            {player.puntos}
          </div>
        </div>
      ))}
    </div>
  );
}