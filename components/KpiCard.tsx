interface Props {
  title: string;
  value: string | number;
}

export default function KpiCard({
  title,
  value,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        bg-white/95
        backdrop-blur-sm
        p-5
        shadow-lg
        border
        border-slate-200
        transition
        hover:shadow-xl
      "
    >
      <div className="text-sm font-medium text-slate-500">
        {title}
      </div>

      <div className="mt-3 text-3xl font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  );
}