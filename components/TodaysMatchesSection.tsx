import {
  MatchPredictionsRow,
} from "@/lib/matchPredictions";
import { calculateMatchPoints } from "@/lib/scoring";

interface Props {
  rows: MatchPredictionsRow[];
  dateLabel: string;
}

interface PredictionGroup {
  score: string;
  impactPoints: number | null;
  players: string[];
}

function formatScore(
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

function groupPredictions(
  row: MatchPredictionsRow
): PredictionGroup[] {
  const groups =
    new Map<
      string,
      {
        impactPoints: number | null;
        players: string[];
      }
    >();
  const canCalculateImpact =
    row.match.goles_local !== "" &&
    row.match.goles_visitante !== "";

  row.predictions.forEach((prediction) => {
    const score = formatScore(
      prediction.golesLocal,
      prediction.golesVisitante
    );
    const impactPoints =
      canCalculateImpact &&
      prediction.golesLocal != null &&
      prediction.golesVisitante != null &&
      prediction.golesLocal !== "" &&
      prediction.golesVisitante !== ""
        ? calculateMatchPoints(
            Number(row.match.goles_local),
            Number(row.match.goles_visitante),
            Number(prediction.golesLocal),
            Number(prediction.golesVisitante)
          ).points
        : null;

    const group =
      groups.get(score) ?? {
        impactPoints,
        players: [],
      };

    group.players.push(prediction.nombre);
    groups.set(score, group);
  });

  return [...groups.entries()]
    .map(([score, group]) => ({
      score,
      impactPoints:
        group.impactPoints,
      players: group.players,
    }))
    .sort(
      (a, b) =>
        b.players.length -
          a.players.length ||
        a.score.localeCompare(b.score)
    );
}

function getImpactTone(
  points: number | null
) {
  if (points == null) {
    return "bg-slate-100 text-slate-500";
  }

  if (points === 2) {
    return "bg-amber-100 text-amber-700";
  }

  if (points === 1) {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-red-100 text-red-700";
}

function getMatchStatus(row: MatchPredictionsRow) {
  if (row.match.finalizado === "TRUE") {
    return "Finalizado";
  }

  if (
    row.match.goles_local !== "" &&
    row.match.goles_visitante !== ""
  ) {
    return "En juego";
  }

  return "Pendiente";
}

export default function TodaysMatchesSection({
  rows,
  dateLabel,
}: Props) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Partidos de hoy
          </h2>
          <p className="text-sm capitalize text-slate-500">
            {dateLabel}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white/95
            p-5
            text-sm
            text-slate-500
            shadow-lg
            backdrop-blur-sm
          "
        >
          No hay partidos programados para hoy en la hoja de partidos.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => {
            const status =
              getMatchStatus(row);
            const score = formatScore(
              row.match.goles_local,
              row.match.goles_visitante
            );
            const groups =
              groupPredictions(row);

            return (
              <article
                key={row.match.id}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white/95
                  p-5
                  shadow-lg
                  backdrop-blur-sm
                "
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {row.match.hora ||
                        row.match.ronda ||
                        row.match.grupo ||
                        row.match.dia}
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                      {row.match.equipo_local}
                      <span className="px-2 text-slate-400">
                        vs
                      </span>
                      {row.match.equipo_visitante}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-bold
                        ${
                          status === "Finalizado"
                            ? "bg-emerald-100 text-emerald-700"
                            : status === "En juego"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      {status}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {score}
                    </span>
                  </div>
                </div>

                <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {groups.map((group) => (
                    <div
                      key={group.score}
                      className="
                        grid
                        grid-cols-[4.5rem_1fr]
                        gap-3
                        px-3
                        py-2.5
                        sm:grid-cols-[4.5rem_1fr_auto]
                      "
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">
                          {group.score}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                          {group.players.length}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {group.players.join(", ")}
                      </p>
                      <div className="flex items-center justify-end self-stretch">
                        <span
                          className={`
                            inline-flex
                            items-center
                            justify-center
                            rounded-full
                            px-2
                            py-0.5
                            text-xs
                            font-bold
                            sm:min-w-24
                            ${getImpactTone(
                              group.impactPoints
                            )}
                          `}
                        >
                          {group.impactPoints == null
                            ? "pendiente"
                            : `+${group.impactPoints} pts`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
