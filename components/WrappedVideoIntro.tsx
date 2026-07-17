"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const WRAPPED_SEEN_KEY =
  "quiniela-2026-wrapped-seen-v2";

export interface WrappedSummary {
  participants: number;
  matches: number;
  predictions: number;
  worldChampion: string;
  winner: {
    name: string;
    points: number;
  };
  podium: Array<{
    name: string;
    points: number;
  }>;
  exactScores: {
    name: string;
    value: number;
  };
  streak: {
    name: string;
    value: number;
  };
  bestDay: {
    name: string;
    points: number;
    date: string;
  };
  oracle: {
    name: string;
    value: number;
  };
  championHitCount: number;
}

interface Props {
  data: WrappedSummary;
  dryRun: boolean;
  enabled: boolean;
}

interface Scene {
  eyebrow: string;
  content: ReactNode;
  tone: string;
}

const VISUAL_POSITIONS = {
  trophy: "0% 0%",
  championDuck: "33.333% 0%",
  treasureDuck: "66.666% 0%",
  exactScore: "100% 0%",
  streak: "0% 100%",
  bestDay: "33.333% 100%",
  oracle: "66.666% 100%",
  closingDuck: "100% 100%",
} as const;

function WrappedVisual({
  visual,
  label,
  size = "large",
}: {
  visual: keyof typeof VISUAL_POSITIONS;
  label: string;
  size?: "medium" | "large";
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`mx-auto rounded-3xl bg-[url('/wrapped-visuals-v4.png')] bg-[length:400%_200%] bg-no-repeat shadow-2xl ring-1 ring-white/30 ${
        size === "large"
          ? "h-40 w-40 sm:h-60 sm:w-60"
          : "h-28 w-28 sm:h-40 sm:w-40"
      }`}
      style={{
        backgroundPosition: VISUAL_POSITIONS[visual],
      }}
    />
  );
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  if (!year || !month || !day) return dateKey;

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function WrappedVideoIntro({
  data,
  dryRun,
  enabled,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const podiumDisplay = [
    data.podium[1] && {
      ...data.podium[1],
      position: 2,
    },
    data.podium[0] && {
      ...data.podium[0],
      position: 1,
    },
    data.podium[2] && {
      ...data.podium[2],
      position: 3,
    },
  ].filter(
    (
      player
    ): player is {
      name: string;
      points: number;
      position: number;
    } => Boolean(player)
  );
  const scenes: Scene[] = [
    {
      eyebrow: "El torneo que vivimos juntos",
      tone: "from-[#17104F] via-[#2754FF] to-[#6D16E8]",
      content: (
        <>
          <WrappedVisual
            visual="trophy"
            label="Copa dorada rodeada de formas de colores"
            size="medium"
          />
          <h2 className="mt-5 text-4xl font-black uppercase leading-none sm:text-7xl">
            Quiniela Mundial 2026
          </h2>
        </>
      ),
    },
    {
      eyebrow: "Todo comenzó con",
      tone: "from-[#2754FF] via-[#0F8FEA] to-[#42E8D0]",
      content: (
        <div className="grid grid-cols-3 gap-3 sm:gap-8">
          {[
            [data.participants, "participantes"],
            [data.matches, "partidos"],
            [data.predictions, "pronósticos"],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-4xl font-black sm:text-7xl">
                {value}
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-white/75 sm:text-base">
                {label}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "Campeón del mundo",
      tone: "from-[#17104F] via-[#6D16E8] to-[#ED1B0C]",
      content: (
        <>
          <WrappedVisual
            visual="trophy"
            label="Copa del campeonato mundial"
          />
          <div className="mt-5 text-5xl font-black uppercase sm:text-8xl">
            {data.worldChampion}
          </div>
        </>
      ),
    },
    {
      eyebrow: "Y quien conquistó la quiniela fue…",
      tone: "from-[#ED1B0C] via-[#6D16E8] to-[#17104F]",
      content: (
        <>
          <WrappedVisual
            visual="championDuck"
            label="Pato Merlín celebrando con una corona"
            size="medium"
          />
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.winner.name}
          </div>
          <div className="mt-3 text-2xl font-bold text-[#B7E600] sm:text-4xl">
            {data.winner.points} puntos
          </div>
        </>
      ),
    },
    {
      eyebrow: "El podio final",
      tone: "from-[#17104F] via-[#2754FF] to-[#6D16E8]",
      content: (
        <div>
          <WrappedVisual
            visual="treasureDuck"
            label="Pato Merlín celebrando sobre monedas y billetes"
            size="medium"
          />
          <div className="mt-5 flex items-end justify-center gap-2 sm:gap-5">
            {podiumDisplay.map((player) => (
              <div
                key={player.name}
                className={`w-28 rounded-t-3xl bg-white/15 p-4 backdrop-blur sm:w-48 ${
                  player.position === 1
                    ? "pb-12 sm:pb-20"
                    : player.position === 2
                    ? "pb-8 sm:pb-12"
                    : "pb-5 sm:pb-8"
                }`}
              >
                <div className="text-xl font-black text-white/60">
                  {player.position}
                </div>
                <div className="mt-2 truncate text-lg font-black sm:text-2xl">
                  {player.name}
                </div>
                <div className="text-sm font-bold text-white/70 sm:text-lg">
                  {player.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      eyebrow: "Puntería perfecta",
      tone: "from-[#6D16E8] via-[#ED1B0C] to-[#FF7A00]",
      content: (
        <>
          <WrappedVisual
            visual="exactScore"
            label="Balón golpeando el centro de una diana"
            size="medium"
          />
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.exactScores.name}
          </div>
          <div className="mt-3 text-2xl font-bold sm:text-4xl">
            {data.exactScores.value} marcadores exactos
          </div>
        </>
      ),
    },
    {
      eyebrow: "Imparable",
      tone: "from-[#17104F] via-[#2754FF] to-[#42E8D0]",
      content: (
        <>
          <WrappedVisual
            visual="streak"
            label="Tarjetas de partidos avanzando entre llamas"
            size="medium"
          />
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.streak.name}
          </div>
          <div className="mt-3 text-2xl font-bold sm:text-4xl">
            {data.streak.value} resultados seguidos
          </div>
        </>
      ),
    },
    {
      eyebrow: "Un día para recordar",
      tone: "from-[#2754FF] via-[#6D16E8] to-[#ED1B0C]",
      content: (
        <>
          <WrappedVisual
            visual="bestDay"
            label="Calendario despegando como un cohete"
            size="medium"
          />
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.bestDay.name}
          </div>
          <div className="mt-3 text-2xl font-bold sm:text-4xl">
            {data.bestDay.points} puntos · {formatDate(data.bestDay.date)}
          </div>
        </>
      ),
    },
    {
      eyebrow: "El oráculo",
      tone: "from-[#17104F] via-[#6D16E8] to-[#B20724]",
      content: (
        <>
          <WrappedVisual
            visual="oracle"
            label="Balón-oráculo anticipando resultados de partidos"
            size="medium"
          />
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.oracle.name}
          </div>
          <div className="mt-3 text-2xl font-bold sm:text-4xl">
            {data.oracle.value} resultados acertados
          </div>
        </>
      ),
    },
    {
      eyebrow: `${data.championHitCount} predijeron al campeón`,
      tone: "from-[#B7E600] via-[#42E8D0] to-[#2754FF]",
      content: (
        <>
          <WrappedVisual
            visual="closingDuck"
            label="Pato Merlín despidiéndose entre confeti"
          />
          <div className="mt-5 text-4xl font-black uppercase sm:text-7xl">
            Gracias por jugar
          </div>
          <div className="mt-3 text-xl font-bold text-white/80 sm:text-3xl">
            Nos vemos en la próxima quiniela
          </div>
        </>
      ),
    },
  ];
  const defaultSceneDuration = dryRun ? 3500 : 6000;
  const isFirstScene = sceneIndex === 0;
  const isLastScene = sceneIndex === scenes.length - 1;
  const currentSceneDuration = isFirstScene
    ? 5000
    : isLastScene
      ? 10000
      : defaultSceneDuration;

  useEffect(() => {
    if (!enabled && !dryRun) return;

    const hasSeenWrapped =
      window.localStorage.getItem(
        WRAPPED_SEEN_KEY
      ) === "true";

    if (!dryRun && hasSeenWrapped) return;

    const openTimer = window.setTimeout(
      () => setIsOpen(true),
      0
    );

    if (!dryRun) {
      window.localStorage.setItem(
        WRAPPED_SEEN_KEY,
        "true"
      );
    }

    return () => window.clearTimeout(openTimer);
  }, [dryRun, enabled]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = 0;
      audio.muted = true;
      void audio.play().catch(() => undefined);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const sceneTimer = window.setTimeout(() => {
      if (sceneIndex >= scenes.length - 1) {
        setIsOpen(false);
        audioRef.current?.pause();
        return;
      }

      setSceneIndex((current) => current + 1);
    }, currentSceneDuration);

    return () => window.clearTimeout(sceneTimer);
  }, [
    isOpen,
    isPaused,
    currentSceneDuration,
    sceneIndex,
    scenes.length,
  ]);

  if (!enabled && !dryRun) return null;

  function closeWrapped() {
    audioRef.current?.pause();
    setIsPaused(false);
    setIsOpen(false);
  }

  async function toggleSound() {
    const audio = audioRef.current;

    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      await audio.play().catch(() => undefined);
    } else {
      audio.muted = true;
    }

    setIsMuted((current) => !current);
  }

  function replayWrapped() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = true;
    }

    setSceneIndex(0);
    setIsMuted(true);
    setIsPaused(false);
    setIsOpen(true);
  }

  function previousScene() {
    setSceneIndex((current) => Math.max(0, current - 1));
  }

  function nextScene() {
    if (sceneIndex >= scenes.length - 1) {
      closeWrapped();
      return;
    }

    setSceneIndex((current) => current + 1);
  }

  function togglePlayback() {
    setIsPaused((current) => !current);
  }

  const scene = scenes[sceneIndex];

  return (
    <>
      <audio
        ref={audioRef}
        src="/wrapped-2026.mp3"
        muted={isMuted}
        loop
        preload="none"
        onError={() => setHasAudio(false)}
      />

      {!isOpen && (
        <button
          type="button"
          onClick={replayWrapped}
          className="fixed bottom-4 right-4 z-40 rounded-full bg-[#17104F] px-4 py-3 text-sm font-extrabold text-white shadow-xl ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:bg-[#2b1b80]"
        >
          Ver Wrapped 2026
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Wrapped global de la Quiniela Mundial 2026"
          className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br text-white ${scene.tone}`}
        >
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#B7E600]/70 blur-sm" />
          <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-[40%] bg-[#ED1B0C]/70 blur-sm" />

          <div
            key={sceneIndex}
            className="wrapped-scene-enter relative z-10 w-full max-w-6xl px-6 text-center"
          >
            <div className="mb-5 text-sm font-black uppercase tracking-[0.24em] text-white/75 sm:text-xl">
              {scene.eyebrow}
            </div>
            {scene.content}
          </div>

          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-extrabold uppercase tracking-widest backdrop-blur">
              {dryRun ? "Dry run" : "Wrapped 2026"}
            </span>
            <button
              type="button"
              onClick={closeWrapped}
              aria-label="Cerrar Wrapped"
              className="rounded-full bg-black/25 p-2 backdrop-blur transition hover:bg-black/45"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
            <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500"
                style={{
                  width: `${((sceneIndex + 1) / scenes.length) * 100}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleSound}
                disabled={!hasAudio}
                className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-black/35 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
                {!hasAudio
                  ? "Audio pendiente"
                  : isMuted
                  ? "Activar sonido"
                  : "Silenciar"}
              </button>

              <div className="order-first flex w-full items-center justify-center gap-2 sm:order-none sm:w-auto">
                <button
                  type="button"
                  onClick={previousScene}
                  disabled={sceneIndex === 0}
                  aria-label="Escena anterior"
                  className="rounded-full bg-black/20 p-3 backdrop-blur transition hover:bg-black/35 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label={
                    isPaused
                      ? "Reanudar Wrapped"
                      : "Pausar Wrapped"
                  }
                  className="rounded-full bg-white p-3 text-[#17104F] shadow-lg transition hover:scale-105"
                >
                  {isPaused ? (
                    <Play className="h-5 w-5 fill-current" />
                  ) : (
                    <Pause className="h-5 w-5 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={nextScene}
                  aria-label="Siguiente escena"
                  className="rounded-full bg-black/20 p-3 backdrop-blur transition hover:bg-black/35"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={closeWrapped}
                className="rounded-full px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-black/20 hover:text-white"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
