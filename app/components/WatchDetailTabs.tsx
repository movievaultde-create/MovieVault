"use client";

import { useState, type ReactNode } from "react";

export type WatchTabId = "details" | "info" | "cast" | "episodes";

type TabDef = { id: WatchTabId; label: string };

export default function WatchDetailTabs({
  tabs,
  panels,
  defaultTab = "details",
}: {
  tabs: TabDef[];
  panels: Partial<Record<WatchTabId, ReactNode>>;
  defaultTab?: WatchTabId;
}) {
  const available = tabs.filter((tab) => panels[tab.id] != null);
  const [active, setActive] = useState<WatchTabId>(
    available.some((t) => t.id === defaultTab) ? defaultTab : available[0]?.id ?? "details"
  );

  if (available.length === 0) return null;

  const current = available.some((t) => t.id === active) ? active : available[0].id;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="flex gap-0 overflow-x-auto border-b border-[var(--border)]">
        {available.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`shrink-0 px-4 py-3.5 text-sm font-bold transition sm:px-5 ${
              current === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">{panels[current]}</div>
    </div>
  );
}
