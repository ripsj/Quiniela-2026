import {
  Participant,
  Match,
  Prediction,
  SpecialPrediction,
  Scorer,
} from "@/lib/types";

import {
  loadCsv,
  loadOptionalCsv,
} from "@/lib/googleSheets";
import { SHEETS } from "@/lib/sheets";
import { buildRanking } from "@/lib/ranking";
import KpiCard from "@/components/KpiCard";
import RankingTable from "@/components/RankingTable";
import Podium from "@/components/Podium";
import RankingHistoryChart from "@/components/RankingHistoryChart";
import {
  buildRankingHistory,
  buildRankingPositionChanges,
} from "@/lib/rankingHistory";
import { buildPointsHistory }
from "@/lib/pointsHistory";
import { buildStats } from "@/lib/stats";
import { buildRecentForm } from "@/lib/recentForm";
import StatsSection from "@/components/StatsSection";
import {
  buildComebacks,
} from "@/lib/comebacks";
import { buildMatchPredictions } from "@/lib/matchPredictions";

import PointsHistoryChart
from "@/components/PointsHistoryChart";
import DashboardTabs from "@/components/DashboardTabs";
import MatchPredictionsTable from "@/components/MatchPredictionsTable";
import TodaysMatchesSection from "@/components/TodaysMatchesSection";
import SpecialPredictionsSection from "@/components/SpecialPredictionsSection";
import {
  filterMatchPredictionsByDate,
  formatDateKeyForDisplay,
  getTodayDateKey,
} from "@/lib/matchDay";
import { buildSpecialPredictions } from "@/lib/specialPredictions";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const revalidate = 60;

export default async function Home() {

  

  const [
    participants,
    matches,
    predictions,
    specialPredictionsRows,
    scorers,
  ] = await Promise.all([
    loadCsv<Participant>(
      SHEETS.participantes
    ),
    loadCsv<Match>(
      SHEETS.partidos
    ),
    loadCsv<Prediction>(
      SHEETS.pronosticos
    ),
    loadCsv<SpecialPrediction>(
      SHEETS.especiales
    ),
    loadOptionalCsv<Scorer>(
      SHEETS.goleadores
    ),
  ]);

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

  const rankingPositionChanges =
    buildRankingPositionChanges(
      rankingHistory
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

  const rankedParticipants =
  ranking.map((player) => ({
    id: player.participanteId,
    nombre: player.nombre,
  }));

  const matchPredictions =
  buildMatchPredictions(
    rankedParticipants,
    matches,
    predictions
  );

  const todayDateKey =
  getTodayDateKey();

  const todaysMatchPredictions =
  filterMatchPredictionsByDate(
    matchPredictions,
    todayDateKey
  );

  const specialPredictions =
  buildSpecialPredictions(
    participants,
    specialPredictionsRows
  );

  ranking.forEach((player) => {
    player.forma =
      recentForm.get(
        String(player.participanteId)
      ) ?? [];
    player.cambioPosicion =
      rankingPositionChanges.get(
        player.nombre
      ) ?? 0;
  });
  return (
    <main className="
    relative
    mx-auto
    max-w-7xl
    overflow-x-hidden
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

      <DashboardTabs
        tabs={[
          {
            id: "ranking",
            label: "Ranking",
            content: (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">
                    🏆 Clasificación General
                  </h2>
                </div>

                <RankingTable ranking={ranking} />
              </>
            ),
          },
          {
            id: "hoy",
            label: "Hoy",
            content: (
              <TodaysMatchesSection
                rows={
                  todaysMatchPredictions
                }
                dateLabel={
                  formatDateKeyForDisplay(
                    todayDateKey
                  )
                }
              />
            ),
          },
          {
            id: "partidos",
            label: "Partidos",
            content: (
              <MatchPredictionsTable
                rows={matchPredictions}
              />
            ),
          },
          {
            id: "especiales",
            label: "Especiales",
            content: (
              <SpecialPredictionsSection
                categories={specialPredictions}
                scorers={scorers}
              />
            ),
          },
        ]}
      />

      <StatsSection
        stats={{
          ...stats,
          comeback
        }}
      />

      <DashboardTabs
        tabs={[
          {
            id: "puntos",
            label: "Puntos",
            content: (
              <PointsHistoryChart
                data={pointsHistory}
              />
            ),
          },
          {
            id: "posiciones",
            label: "Posiciones",
            content: (
              <RankingHistoryChart
                data={rankingHistory}
              />
            ),
          },
        ]}
      />
      <Analytics />
       <SpeedInsights />
    </main>
  );
}
