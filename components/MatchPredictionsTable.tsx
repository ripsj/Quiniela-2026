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
          max-h-[72vh]
          overflow-auto
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
              <th className="sticky left-0 top-0 z-40 w-56 bg-[#001F5B] p-4 text-left">
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
                    border-t
                    border-slate-200
                    transition
                    hover:bg-slate-50
                  "
                >
                  <td className="sticky left-0 z-10 bg-white p-4">
                    <div className="font-bold text-slate-900">
                      <span className="mr-2 text-slate-400">
                        {index + 1}
                      </span>
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
