import { RankingEntry } from "@/lib/types";

interface Props {
  ranking: RankingEntry[];
}

export default function Podium({
  ranking,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">

      <div className="rounded-xl border p-4 text-center">
        🥇
        <div className="mt-2 font-bold">
          {ranking[0]?.nombre}
        </div>
      </div>

      <div className="rounded-xl border p-4 text-center">
        🥈
        <div className="mt-2 font-bold">
          {ranking[1]?.nombre}
        </div>
      </div>

      <div className="rounded-xl border p-4 text-center">
        🥉
        <div className="mt-2 font-bold">
          {ranking[2]?.nombre}
        </div>
      </div>

    </div>
  );
}