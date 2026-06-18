import {
  Participant,
  Match,
  Prediction,
} from "@/lib/types";

import { loadCsv } from "@/lib/googleSheets";
import { SHEETS } from "@/lib/sheets";
import { buildRanking } from "@/lib/ranking";
import KpiCard from "@/components/KpiCard";
import RankingTable from "@/components/RankingTable";
import Podium from "@/components/Podium";

export default async function Home() {

  

  const participants =
    await loadCsv<Participant>(
      SHEETS.participantes
    );

  const matches =
    await loadCsv<Match>(
      SHEETS.partidos
    );

  const predictions =
    await loadCsv<Prediction>(
      SHEETS.pronosticos
    );

  const ranking =
    buildRanking(
      participants,
      matches,
      predictions
    );

  

  return (
    <main className="mx-auto max-w-6xl p-6">

      <h1 className="mb-6 text-4xl font-bold">
        🏆 Quiniela Mundial 2026
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <KpiCard
          title="Líder"
          value={ranking[0]?.nombre}
        />

        <KpiCard
          title="Participantes"
          value={ranking.length}
        />

        <KpiCard
          title="Partidos Jugados"
          value={
            matches.filter(
              m =>
                m.goles_local !== null &&
                m.goles_visitante !== null
            ).length
          }
        />

        <KpiCard
          title="Puntos Totales"
          value={
            ranking.reduce(
              (sum, p) =>
                sum + p.puntos,
              0
            )
          }
        />

      </div>

      <div className="my-6">
        <Podium ranking={ranking} />
      </div>

      <RankingTable ranking={ranking} />

    </main>
  );
}