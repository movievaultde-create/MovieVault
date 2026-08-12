"use client";

import { LANGUAGES, type Lang } from "../context/LanguageContext";
import type { WatchServer } from "../lib/directStreamMap";

type Props = {
  servers: WatchServer[];
  activeServer: number;
  onSelectServer: (index: number) => void;
  lang: Lang;
  onSelectLang: (code: Lang) => void;
  serversLabel: string;
  subtitlesLabel: string;
  recommendedLabel: string;
};

export default function WatchStreamTabs({
  servers,
  activeServer,
  onSelectServer,
  lang,
  onSelectLang,
  serversLabel,
  subtitlesLabel,
  recommendedLabel,
}: Props) {
  return (
    <div className="watch-stream-panel mb-0 overflow-hidden rounded-t-xl border border-b-0 border-[#2a2a2a] bg-[#141414]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2a2a2a] px-3 py-2.5">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#9ca3af]">
          {subtitlesLabel}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLang(l.code)}
                className={`watch-stream-tab ${active ? "watch-stream-tab-active" : ""}`}
              >
                <span className="me-1">{l.flag}</span>
                {l.code}
                {active && <span className="watch-stream-tab-caret" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#9ca3af]">
          {serversLabel}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {servers.map((server, i) => {
            const active = activeServer === i;
            const title = server.premium ? "MovieVault" : server.label;
            const showRecommended = Boolean(server.recommended) && !active;
            return (
              <button
                key={`${server.name}-${i}`}
                type="button"
                onClick={() => onSelectServer(i)}
                className={`watch-stream-tab ${active ? "watch-stream-tab-active" : ""} ${
                  server.recommended && !active ? "watch-stream-tab-premium" : ""
                }`}
                title={`${server.name} · ${server.label}`}
              >
                {title}
                {showRecommended && (
                  <span className="ms-1.5 rounded bg-white/15 px-1 py-0.5 text-[9px] font-bold uppercase">
                    {recommendedLabel}
                  </span>
                )}
                {active && <span className="watch-stream-tab-caret" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
