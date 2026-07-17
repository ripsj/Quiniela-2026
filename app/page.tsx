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
import { buildMatchPredictions } from "@/lib/matchPredictions";

import PointsHistoryChart
from "@/components/PointsHistoryChart";
import DashboardTabs from "@/components/DashboardTabs";
import MatchPredictionsTable from "@/components/MatchPredictionsTable";
import SpecialPredictionsSection from "@/components/SpecialPredictionsSection";
import {
  buildSpecialPredictions,
  getOpenSpecialPoints,
} from "@/lib/specialPredictions";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Image from "next/image";
import tournamentBanner from "@/quiniela-banner.png";
import WrappedVideoIntro from "@/components/WrappedVideoIntro";

export const revalidate = 60;

export default async function Home() {
  const wrappedDryRun =
    process.env.NEXT_PUBLIC_WRAPPED_DRY_RUN ===
    "true";

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

  const effectiveSpecialPredictionsRows =
    wrappedDryRun
      ? specialPredictionsRows.map(
          (row, index) =>
            index === 0
              ? {
                  ...row,
                  campeon_resultado: "España",
                  subcampeon_resultado: "Argentina",
                  tercer_lugar_resultado: "Francia",
                  fase_mexico_resultado: "Octavos",
                  mvp_resultado: "Lamine Yamal",
                  goleador_resultado: "Kylian Mbappé",
                }
              : row
        )
      : specialPredictionsRows;

  const ranking =
    buildRanking(
      participants,
      matches,
      predictions,
      effectiveSpecialPredictionsRows
    );

  const rankingHistory =
    buildRankingHistory(
      participants,
      matches,
      predictions,
      effectiveSpecialPredictionsRows
    );

  const rankingPositionChanges =
    buildRankingPositionChanges(
      rankingHistory
    );

  const pointsHistory =
  buildPointsHistory(
    participants,
    matches,
    predictions,
    effectiveSpecialPredictionsRows
  );

  const stats =
  buildStats(
    ranking,
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

  const specialPredictions =
  buildSpecialPredictions(
    participants,
    effectiveSpecialPredictionsRows
  );

  const specialPointsInPlay =
    getOpenSpecialPoints(
      specialPredictions
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
  const championCategory =
    specialPredictions.find(
      (category) =>
        category.category.key === "campeon"
    );
  const championHitCount = new Set(
    championCategory?.groups.flatMap((group) =>
      group.players
        .filter((player) => player.status === "hit")
        .map((player) => player.participanteId)
    ) ?? []
  ).size;
  const wrappedSummary = {
    participants: participants.length,
    matches: matches.filter(
      (match) => match.finalizado === "TRUE"
    ).length,
    predictions: predictions.filter(
      (prediction) =>
        prediction.goles_local !== "" &&
        prediction.goles_visitante !== ""
    ).length,
    worldChampion:
      championCategory?.result ?? "Por definir",
    winner: {
      name: ranking[0]?.nombre ?? "Por definir",
      points: ranking[0]?.puntos ?? 0,
    },
    podium: ranking.slice(0, 3).map((player) => ({
      name: player.nombre,
      points: player.puntos,
    })),
    exactScores: {
      name: stats.masExactos?.nombre ?? "Por definir",
      value: stats.masExactos?.exactos ?? 0,
    },
    streak: {
      name: stats.mejorRacha?.nombre ?? "Por definir",
      value: stats.mejorRacha?.racha ?? 0,
    },
    bestDay: {
      name: stats.mejorJornada?.nombre ?? "Por definir",
      points: stats.mejorJornada?.puntos ?? 0,
      date: stats.mejorJornada?.fecha ?? "",
    },
    oracle: {
      name: stats.masResultados?.nombre ?? "Por definir",
      value: stats.masResultados?.resultados ?? 0,
    },
    championHitCount,
  };
  return (
    <>
      <WrappedVideoIntro
        data={wrappedSummary}
        dryRun={wrappedDryRun}
        enabled={
          process.env.NEXT_PUBLIC_WRAPPED_ENABLED ===
          "true"
        }
      />
      <main className="
    relative
    mx-auto
    max-w-7xl
    overflow-x-hidden
    p-4
    md:p-8
    ">
      <div className="relative mb-10 h-[280px] overflow-hidden rounded-3xl bg-[#07175d] shadow-2xl ring-1 ring-white/40 sm:aspect-[3/1] sm:h-auto">
        <Image
          src={tournamentBanner}
          alt="Pato Merlín en una celebración gráfica del Mundial 2026"
          fill
          preload
          sizes="(max-width: 640px) 100vw, 1280px"
          className="object-cover object-[66%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07175d]/95 via-[#07175d]/55 to-transparent sm:via-[#07175d]/20" />
        <div className="absolute inset-0 flex max-w-[68%] flex-col justify-center p-6 text-white sm:max-w-[58%] sm:p-10 lg:p-14">
          <h1 className="text-3xl font-extrabold leading-tight drop-shadow-lg sm:text-4xl lg:text-6xl">
            🏆 Quiniela Mundial 2026
          </h1>
          <p className="mt-3 text-sm font-semibold text-white/85 drop-shadow md:text-lg">
            Ranking en tiempo real
          </p>
        </div>
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
          title="Puntos especiales abiertos"
          value={specialPointsInPlay}
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
        stats={stats}
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
    </>
  );
}
