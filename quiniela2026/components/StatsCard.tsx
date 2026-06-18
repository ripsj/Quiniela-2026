interface Props {
  title: string;
  value: string | number;
}

export default function StatsCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}