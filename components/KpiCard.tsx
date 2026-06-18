interface Props {
  title: string;
  value: string | number;
}

export default function KpiCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-xl border p-4 shadow">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}