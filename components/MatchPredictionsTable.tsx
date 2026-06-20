import {
  MatchPredictionCell,
  MatchPredictionsRow,
} from "@/lib/matchPredictions";

interface Props {
  rows: MatchPredictionsRow[];
}

function formatPrediction(
  golesLocal: string | null | undefined,
  golesVisitante: string | null | undefined
) {
  if (
    golesLocal == null ||
    golesVisitante == null ||
    golesLocal === "" ||
    golesVisitante === ""
  ) {
    return "-";
  }

  return `${golesLocal}-${golesVisitante}`;
}

function getCellTone(
  prediction: MatchPredictionCell | undefined
) {
  if (prediction?.puntos == null) {
    return "";
  }

  if (prediction.exacto) {
    return "bg-amber-50";
  }

  if (prediction.resultado) {
    return "bg-emerald-50";
  }

  if (prediction.puntos === 0) {
    return "bg-red-50";
  }

  return "";
}

function getPointsTone(
  prediction: MatchPredictionCell
) {
  if (prediction.exacto) {
    return "bg-amber-100 text-amber-700";
  }

  if (prediction.resultado) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (prediction.puntos === 0) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-500";
}

function formatRank(index: number) {
  if (index === 0) {
    return "🥇";
  }

  if (index === 1) {
    return "🥈";
  }

  if (index === 2) {
    return "🥉";
  }

  return index + 1;
}

export default function MatchPredictionsTable({
  rows,
}: Props) {
  const participants =
    rows[0]?.predictions ?? [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Todos los partidos y predicciones
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Jugadores ordenados por ranking. En partidos finalizados, el color muestra puntos obtenidos.
        </p>
      </div>

      <div
        className="
          overflow-x-auto
          scroll-smooth
          rounded-2xl
          border
          border-white/20
          bg-white/95
          shadow-lg
          backdrop-blur-sm
        "
      >
        <table className="min-w-[1200px] w-full">
          <thead className="sticky top-0 z-30">
            <tr
              className="
                bg-gradient-to-r
                from-[#001F5B]
                to-[#8B1538]
                text-white
              "
            >
              <th className="sticky left-0 top-0 z-50 w-12 min-w-12 max-w-12 bg-[#001F5B] px-2 py-4 text-center sm:w-16 sm:min-w-16 sm:max-w-16 sm:p-4">
                #
              </th>
              <th className="sticky left-12 top-0 z-50 w-32 min-w-32 max-w-32 bg-[#001F5B] px-3 py-4 text-left sm:left-16 sm:w-48 sm:min-w-48 sm:max-w-48 sm:p-4 md:w-56 md:min-w-56 md:max-w-56">
                Jugador
              </th>
              {rows.map((row) => {
                const isFinished =
                  row.match.finalizado === "TRUE";
                const finalScore =
                  formatPrediction(
                    row.match.goles_local,
                    row.match.goles_visitante
                  );

                return (
                  <th
                    key={row.match.id}
                    className="sticky top-0 z-30 min-w-40 bg-[#4B1C4A] p-3 text-center align-top"
                  >
                    <div className="text-sm font-bold leading-snug">
                      {row.match.equipo_local}
                    </div>
                    <div className="text-xs font-medium text-white/75">
                      vs
                    </div>
                    <div className="text-sm font-bold leading-snug">
                      {row.match.equipo_visitante}
                    </div>
                    <div className="mt-2 text-xs font-medium text-white/80">
                      {row.match.fecha ||
                        row.match.dia ||
                        "-"}
                    </div>
                    <div className="mt-1 text-xs font-bold text-white">
                      {isFinished
                        ? finalScore
                        : "Pendiente"}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {participants.map(
              (participant, index) => (
                <tr
                  key={
                    participant.participanteId
                  }
                  className="
                    group
                    border-t
                    border-slate-200
                    transition
                    hover:bg-slate-50
                  "
                >
                  <td
                    className="
                      sticky
                      left-0
                      z-20
                      w-12
                      min-w-12
                      max-w-12
                      bg-white
                      px-2
                      py-4
                      text-center
                      font-bold
                      transition
                      group-hover:bg-slate-50
                      sm:w-16
                      sm:min-w-16
                      sm:max-w-16
                      sm:p-4
                    "
                  >
                    {formatRank(index)}
                  </td>

                  <td
                    className="
                      sticky
                      left-12
                      z-20
                      w-32
                      min-w-32
                      max-w-32
                      bg-white
                      px-3
                      py-4
                      font-semibold
                      text-slate-900
                      transition
                      group-hover:bg-slate-50
                      sm:left-16
                      sm:w-48
                      sm:min-w-48
                      sm:max-w-48
                      sm:p-4
                      md:w-56
                      md:min-w-56
                      md:max-w-56
                    "
                  >
                    <div className="truncate">
                      {participant.nombre}
                    </div>
                  </td>

                  {rows.map((row) => {
                    const prediction =
                      row.predictions.find(
                        (item) =>
                          item.participanteId ===
                          participant.participanteId
                      );

                    return (
                      <td
                        key={row.match.id}
                        className={`
                          p-3
                          text-center
                          transition
                          ${getCellTone(prediction)}
                        `}
                      >
                        <div className="font-semibold text-slate-900">
                          {formatPrediction(
                            prediction?.golesLocal,
                            prediction?.golesVisitante
                          )}
                        </div>
                        {prediction?.puntos != null && (
                          <div
                            className={`
                              mt-1
                              inline-flex
                              rounded-full
                              px-2
                              py-0.5
                              text-xs
                              font-bold
                              ${getPointsTone(prediction)}
                            `}
                          >
                            {prediction.puntos} pts
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
