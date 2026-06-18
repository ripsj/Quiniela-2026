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

  console.log(matches[0]);
  console.log(predictions[0]);
  console.log(participants[0]);

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Quiniela Mundial 2026
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <KpiCard
          title="Líder"
          value={ranking[0]?.nombre ?? "-"}
        />
        <KpiCard
          title="Participantes"
          value={ranking.length}
        />
      </div>

      <RankingTable ranking={ranking} />
    </main>
  );
}