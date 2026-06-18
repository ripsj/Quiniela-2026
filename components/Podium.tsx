import { RankingEntry } from "@/lib/types";

interface Props {
  ranking: RankingEntry[];
}

export default function Podium({
  ranking,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 items-end">

      <div
        className="
          rounded-2xl
          border
          border-slate-300
          bg-white/95
          backdrop-blur-sm
          p-4
          text-center
          shadow-lg
          h-40
          flex
          flex-col
          justify-center
          bg-gradient-to-b
          from-slate-200
          to-slate-50
        "
      >
        <div className="text-4xl">🥈</div>

        <div className="mt-2 font-bold text-slate-900">
          {ranking[1]?.nombre}
        </div>

        <div className="mt-1 text-sm text-slate-500">
          {ranking[1]?.puntos ?? 0} pts
        </div>
      </div>

      <div
        className="
          rounded-2xl
          border-2
          border-yellow-400
          bg-yellow-50
          p-4
          text-center
          shadow-xl
          h-52
          flex
          flex-col
          justify-center
          bg-gradient-to-b
          from-yellow-200
          to-yellow-50
        "
      >
        <div className="text-5xl">🥇</div>

        <div className="mt-3 text-lg font-extrabold text-slate-900">
          {ranking[0]?.nombre}
        </div>

        <div className="mt-1 font-semibold text-yellow-700">
          {ranking[0]?.puntos ?? 0} pts
        </div>
      </div>

      <div
        className="
          rounded-2xl
          border
          border-orange-300
          bg-orange-50
          p-4
          text-center
          shadow-lg
          h-32
          flex
          flex-col
          justify-centerbg-gradient-to-b
          from-orange-200
          to-orange-50
        "
      >
        <div className="text-4xl">🥉</div>

        <div className="mt-2 font-bold text-slate-900">
          {ranking[2]?.nombre}
        </div>

        <div className="mt-1 text-sm text-slate-500">
          {ranking[2]?.puntos ?? 0} pts
        </div>
      </div>

    </div>
  );
}