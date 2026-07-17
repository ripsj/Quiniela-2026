"use client";

import {
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
  loneWolf: {
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
  const [hasAudio, setHasAudio] = useState(!dryRun);
  const [sceneIndex, setSceneIndex] = useState(0);
  const sceneDuration = dryRun ? 3500 : 6000;
  const scenes: Scene[] = [
    {
      eyebrow: "El torneo que vivimos juntos",
      tone: "from-[#17104F] via-[#2754FF] to-[#6D16E8]",
      content: (
        <>
          <div className="text-6xl sm:text-8xl">🏆</div>
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
          <div className="text-6xl sm:text-8xl">⭐</div>
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
          <div className="text-6xl">👑</div>
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
        <div className="flex items-end justify-center gap-2 sm:gap-5">
          {data.podium.map((player, index) => (
            <div
              key={player.name}
              className={`w-28 rounded-t-3xl bg-white/15 p-4 backdrop-blur sm:w-48 ${
                index === 0 ? "pb-14 sm:pb-20" :
                index === 1 ? "pb-9 sm:pb-12" : "pb-5 sm:pb-7"
              }`}
            >
              <div className="text-3xl">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
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
      ),
    },
    {
      eyebrow: "Puntería perfecta",
      tone: "from-[#6D16E8] via-[#ED1B0C] to-[#FF7A00]",
      content: (
        <>
          <div className="text-7xl">🎯</div>
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
          <div className="text-7xl">🔥</div>
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
          <div className="text-7xl">🚀</div>
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
      eyebrow: "Nadie más lo vio venir",
      tone: "from-[#17104F] via-[#6D16E8] to-[#B20724]",
      content: (
        <>
          <div className="text-7xl">🐺</div>
          <div className="mt-4 text-5xl font-black sm:text-8xl">
            {data.loneWolf.name}
          </div>
          <div className="mt-3 text-2xl font-bold sm:text-4xl">
            {data.loneWolf.value} exactos únicos
          </div>
        </>
      ),
    },
    {
      eyebrow: `${data.championHitCount} predijeron al campeón`,
      tone: "from-[#B7E600] via-[#42E8D0] to-[#2754FF]",
      content: (
        <>
          <div className="text-7xl">🦆</div>
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
    const sceneTimer = window.setInterval(() => {
      setSceneIndex((current) => {
        if (current >= scenes.length - 1) {
          window.clearInterval(sceneTimer);
          window.setTimeout(() => setIsOpen(false), 900);
          return current;
        }

        return current + 1;
      });
    }, sceneDuration);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearInterval(sceneTimer);
    };
  }, [isOpen, sceneDuration, scenes.length]);

  if (!enabled && !dryRun) return null;

  function closeWrapped() {
    audioRef.current?.pause();
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
    setSceneIndex(0);
    setIsMuted(true);
    setIsOpen(true);
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
            <div className="flex items-center justify-between">
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
