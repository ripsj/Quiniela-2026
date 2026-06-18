interface Props {
  title: string;
  value: string | number;
}

export default function KpiCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}