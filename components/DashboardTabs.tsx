"use client";

import { ReactNode, useState } from "react";
import { Table2, Trophy } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
}

const icons = {
  ranking: Trophy,
  partidos: Table2,
};

export default function DashboardTabs({
  tabs,
}: Props) {
  const [activeTab, setActiveTab] =
    useState(tabs[0]?.id ?? "");

  const activeContent =
    tabs.find((tab) => tab.id === activeTab)
      ?.content ?? tabs[0]?.content;

  return (
    <section className="mt-8">
      <div
        role="tablist"
        aria-label="Secciones de la quiniela"
        className="
          mb-6
          inline-flex
          rounded-lg
          border
          border-white/30
          bg-white/90
          p-1
          shadow-lg
          backdrop-blur-sm
        "
      >
        {tabs.map((tab) => {
          const Icon =
            icons[
              tab.id as keyof typeof icons
            ] ?? Table2;
          const isActive =
            tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`
                inline-flex
                min-h-11
                items-center
                gap-2
                rounded-md
                px-4
                py-2
                text-sm
                font-semibold
                transition
                ${
                  isActive
                    ? "bg-[#001F5B] text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
            >
              <Icon
                className="h-4 w-4"
                aria-hidden="true"
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>{activeContent}</div>
    </section>
  );
}
