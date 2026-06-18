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
import RankingHistoryChart from "@/components/RankingHistoryChart";
import { buildRankingHistory } from "@/lib/rankingHistory";
import { buildPointsHistory }
from "@/lib/pointsHistory";
import { buildStats } from "@/lib/stats";
import { buildRecentForm } from "@/lib/recentForm";
import StatsSection from "@/components/StatsSection";
import {
  buildComebacks,
} from "@/lib/comebacks";

import PointsHistoryChart
from "@/components/PointsHistoryChart";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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

  const rankingHistory =
    buildRankingHistory(
      participants,
      matches,
      predictions
    );

  const pointsHistory =
  buildPointsHistory(
    participants,
    matches,
    predictions
  );

  const partidosJugados =
    matches.filter(
      (m) => m.finalizado === "TRUE"
    ).length;
  
    const comeback =
    buildComebacks(
      rankingHistory
    );

  const stats =
  buildStats(
    ranking,
    partidosJugados,
    matches,
    predictions,
    participants
  );

  const recentForm =
  buildRecentForm(
    participants,
    matches,
    predictions
  );

  ranking.forEach((player) => {
    player.forma =
      recentForm.get(
        String(player.participanteId)
      ) ?? [];
  });
  return (
    <main className="
    relative
    mx-auto
    max-w-7xl
    p-4
    md:p-8
    ">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900">
          🏆 Quiniela Mundial 2026
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Ranking en tiempo real
        </p>
      </div>

      <div className="mt-8 mb-8">
        <Podium ranking={ranking} />
      </div>
      <div className="
      mb-4
      grid
      gap-4
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3">


        <KpiCard
          title="Participantes"
          value={ranking.length}
        />

        <KpiCard
          title="Partidos Jugados"
          value={
            matches.filter(
              m => m.finalizado === "TRUE"
            ).length
          }
        />

        <KpiCard
          title="Puntos Máximos Posibles"
          value={
            matches.filter(
              m => m.finalizado === "TRUE"
            ).length * 2
          }
        />

      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          🏆 Clasificación General
        </h2>
      </div>

      <RankingTable ranking={ranking} />
      

      <StatsSection
        stats={{
          ...stats,
          comeback
        }}
      />
      <div className="mt-8">
        <RankingHistoryChart
          data={rankingHistory}
        />
      </div>
      <div className="mt-8">
        <PointsHistoryChart
          data={pointsHistory}
        />
      </div>
      <Analytics />
       <SpeedInsights />
    </main>
  );
}