"use client";

import {
  HelpCircle,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface Props {
  text: string;
}

export default function StatTooltip({
  text,
}: Props) {
  const [isOpen, setIsOpen] =
    useState(false);
  const tooltipId = useId();
  const containerRef =
    useRef<HTMLDivElement>(null);
  const openedByPointerRef =
    useRef(false);

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent
    ) {
      if (
        containerRef.current?.contains(
          event.target as Node
        )
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget
          )
        ) {
          setIsOpen(false);
        }
      }}
    >

      <button
        type="button"
        aria-label="Mostrar ayuda sobre esta estadística"
        aria-describedby={
          isOpen ? tooltipId : undefined
        }
        aria-expanded={isOpen}
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-slate-100
          text-slate-500
          transition
          hover:bg-slate-200
          focus:outline-none
          focus:ring-2
          focus:ring-slate-400
          focus:ring-offset-2
        "
        onPointerDown={() => {
          openedByPointerRef.current = true;
        }}
        onFocus={() => {
          if (!openedByPointerRef.current) {
            setIsOpen(true);
          }
        }}
        onClick={() => {
          setIsOpen((current) => !current);
          window.setTimeout(() => {
            openedByPointerRef.current = false;
          }, 0);
        }}
      >
        <HelpCircle
          aria-hidden="true"
          size={16}
          strokeWidth={2.5}
        />
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`
          absolute
          right-0
          top-10
          z-50
          w-[min(16rem,calc(100vw-2rem))]
          rounded-lg
          bg-slate-900
          p-3
          text-xs
          leading-relaxed
          text-white
          shadow-xl
          transition
          duration-150
          ${
            isOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0"
          }
        `}
      >
        {text.trim()}
      </div>

    </div>
  );
}
