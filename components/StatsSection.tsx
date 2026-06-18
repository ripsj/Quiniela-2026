interface Props {
  stats: {
    masExactos: any;
    mejorDelta: any;
    jugadorDelDia: any;
    comeback: any;
  };
}
import StatTooltip from "./StatTooltip";
export default function StatsSection({
  stats,
}: Props) {
  return (
    <div className="mt-8 mb-4">

      <h2 className="mb-4 text-2xl font-bold text-slate-900">
        🏅 Estadísticas
      </h2>

      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-white/95
            backdrop-blur-sm p-5 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
                🎯 Más marcadores exactos
            </span>

            <StatTooltip
                text="
                Cantidad de marcadores exactos acertados durante el torneo.
                "
            />

            </div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            {stats.masExactos?.nombre}
          </div>

          <div className="text-slate-500">
            {stats.masExactos?.exactos} exactos
          </div>
        </div>

        <div className="rounded-2xl bg-white/95
            backdrop-blur-sm p-5 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
                ⚽ Pronóstico más preciso
            </span>

            <StatTooltip
                text="
                    Cantidad de goles predecidos menos los goles del marcador final. Menor valor es mejor."
            />

            </div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            {stats.mejorDelta?.nombre}
          </div>

          <div className="text-slate-500">
            {stats.mejorDelta?.totalDelta} goles
          </div>
        </div>

        <div className="rounded-2xl bg-white/95
            backdrop-blur-sm p-5 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
                🔥 Jugador del día
            </span>

            <StatTooltip
                text="
                Participante con más resultados acertados en la jornada más reciente. Los empates se resuelven con exactos y puntos.
                "
            />

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

        <div className="rounded-2xl bg-white/95
            backdrop-blur-sm p-5 shadow-lg border border-slate-200">

            <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
                📈 Mayor remontada
            </span>

            <StatTooltip
                text="
                Participante que más posiciones ha ganado en el ranking desde el inicio del torneo.
                "
            />

            </div>

            <div className="mt-2 text-lg font-bold text-slate-900">
                {stats.comeback?.nombre}
            </div>

            <div className="text-slate-500">
                {stats.comeback?.inicio}° ➜ {stats.comeback?.actual}°
            </div>

            <div className="text-emerald-600 font-medium">
                +{stats.comeback?.mejora}
            </div>

            </div>
        </div>

    </div>
  );
}