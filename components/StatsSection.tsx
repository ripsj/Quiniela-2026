interface Props {
  stats: {
    masExactos: any;
    mejorDelta: any;
    jugadorDelDia: any;
  };
}

export default function StatsSection({
  stats,
}: Props) {
  return (
    <div className="mt-8 mb-4">

      <h2 className="mb-4 text-2xl font-bold text-slate-900">
        🏅 Estadísticas
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200">
          <div className="text-sm text-slate-500">
            🎯 Más marcadores exactos
          </div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            {stats.masExactos?.nombre}
          </div>

          <div className="text-slate-500">
            {stats.masExactos?.exactos} exactos
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200">
          <div className="text-sm text-slate-500">
            ⚖️ Mejor delta de goles
          </div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            {stats.mejorDelta?.nombre}
          </div>

          <div className="text-slate-500">
            {stats.mejorDelta?.promedio.toFixed(2)} promedio
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200">
          <div className="text-sm text-slate-500">
            🔥 Jugador del día
          </div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            {stats.jugadorDelDia?.nombre}
          </div>

          <div className="text-slate-500">
            {stats.jugadorDelDia?.resultados} aciertos
          </div>

          <div className="text-slate-400 text-sm">
            {stats.jugadorDelDia?.exactos} exactos
          </div>
        </div>

      </div>

    </div>
  );
}