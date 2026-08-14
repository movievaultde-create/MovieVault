"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLang } from "../../context/LanguageContext";
import { isExoclickVastEnabled } from "../../lib/exoclick";
import { isBrowserSearchCrawler } from "../../lib/isSearchCrawler";
import { tmdbImageUrl } from "../../lib/tmdbImages";

type VastCreative = {
  mediaUrl: string;
  durationSec: number;
  impressionUrls: string[];
  clickThrough: string;
};

type VastPrerollProps = {
  poster?: string;
  onDone: () => void;
  fill?: boolean;
  autoPlayMuted?: boolean;
};

const MANUAL_SKIP_AFTER = 5;
const START_TIMEOUT_MS = 12_000;
const MIDROLL_EVERY_MS = 20 * 60 * 1000;
const START_EVENT = "mv-vast-start";

function posterSrc(poster?: string) {
  return tmdbImageUrl(poster, "w780") || undefined;
}

function firePixels(urls: string[]) {
  urls.forEach((url) => {
    try {
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = url;
    } catch {
      /* ignore */
    }
  });
}

async function loadCreative(): Promise<VastCreative | null> {
  const res = await fetch("/api/ads/vast", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<VastCreative> & { ok?: boolean };
  if (!data?.ok || !data.mediaUrl) return null;
  return {
    mediaUrl: data.mediaUrl,
    durationSec: Number(data.durationSec) || 0,
    impressionUrls: Array.isArray(data.impressionUrls) ? data.impressionUrls : [],
    clickThrough: data.clickThrough || "",
  };
}

/**
 * In-player VAST: starts on user click (or muted for midroll), HTML5 video, skip after 5s.
 */
export function VastPreroll({ poster, onDone, fill = false, autoPlayMuted = false }: VastPrerollProps) {
  const { isAr } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const impressionsSent = useRef(false);
  const [creative, setCreative] = useState<VastCreative | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "playing">(
    autoPlayMuted ? "loading" : "idle",
  );
  const [canSkip, setCanSkip] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MANUAL_SKIP_AFTER);
  const [progress, setProgress] = useState(0);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await loadCreative().catch(() => null);
      if (cancelled) return;
      if (!next) {
        if (autoPlayMuted) finish();
        return;
      }
      setCreative(next);
      if (autoPlayMuted) setPhase("playing");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayMuted]);

  function beginPlayback() {
    if (doneRef.current) return;
    setPhase((current) => (current === "idle" ? "loading" : current));
    const play = (src: string) => {
      setPhase("playing");
      const video = videoRef.current;
      if (!video) return;
      video.muted = autoPlayMuted;
      video.playsInline = true;
      if (video.src !== src) video.src = src;
      void video.play().catch(() => {
        if (autoPlayMuted) finish();
      });
    };

    if (creative?.mediaUrl) {
      play(creative.mediaUrl);
      return;
    }

    void loadCreative()
      .then((next) => {
        if (doneRef.current) return;
        if (!next) {
          finish();
          return;
        }
        setCreative(next);
        play(next.mediaUrl);
      })
      .catch(() => finish());
  }

  useEffect(() => {
    if (autoPlayMuted) return;
    const onStart = () => beginPlayback();
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayMuted, creative]);

  useEffect(() => {
    if (phase !== "playing" || !creative) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = autoPlayMuted;
    video.playsInline = true;
    if (video.getAttribute("src") !== creative.mediaUrl) {
      video.src = creative.mediaUrl;
    }

    const failSafe = window.setTimeout(() => {
      if (!doneRef.current && video.paused && video.currentTime < 0.2) finish();
    }, START_TIMEOUT_MS);

    const skipTick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(skipTick);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const onPlaying = () => {
      if (!impressionsSent.current) {
        impressionsSent.current = true;
        firePixels(creative.impressionUrls);
      }
    };
    const onTime = () => {
      const duration = video.duration || creative.durationSec || 0;
      if (duration > 0) setProgress(Math.min(100, (video.currentTime / duration) * 100));
      if (video.currentTime >= MANUAL_SKIP_AFTER) setCanSkip(true);
    };
    const onEnded = () => finish();
    const onError = () => finish();

    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    void video.play().catch(() => {
      /* click path already tried; overlay remains if still paused */
    });

    return () => {
      window.clearTimeout(failSafe);
      window.clearInterval(skipTick);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, creative]);

  const art = posterSrc(poster);
  const adLabel = isAr ? "إعلان • 1 من أصل 1" : "Ad · 1 of 1";
  const waiting = phase !== "playing";

  return (
    <div
      className={
        fill
          ? "absolute inset-0 z-[70] overflow-hidden bg-black"
          : "relative aspect-video w-full overflow-hidden bg-black"
      }
      data-site-ui="1"
      data-in-player-vast="1"
    >
      {art && waiting && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      )}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-contain ${waiting ? "opacity-0" : "opacity-100"}`}
        playsInline
        poster={art}
        onClick={() => {
          if (creative?.clickThrough) window.open(creative.clickThrough, "_blank", "noopener,noreferrer");
        }}
      />

      {waiting && (
        <button
          type="button"
          onClick={beginPlayback}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/70 px-6 text-center"
        >
          <span className="relative inline-flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <span className="absolute inset-0 rounded-full bg-[var(--accent)]/25 blur-md" />
            <span className="absolute inset-0 rounded-full ring-4 ring-white/25" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] shadow-[0_12px_32px_rgba(37,99,235,0.55)]">
              <svg
                viewBox="0 0 24 24"
                className="ms-1 h-10 w-10 text-white sm:h-12 sm:w-12"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8.25 5.7v12.6c0 .7.76 1.13 1.36.77l10.1-6.3a.9.9 0 0 0 0-1.54l-10.1-6.3a.9.9 0 0 0-1.36.77Z" />
              </svg>
            </span>
          </span>
          <span className="text-xl font-black text-[var(--accent)] sm:text-2xl">
            اضغط للمشاهدة
          </span>
        </button>
      )}

      {!waiting && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4">
            <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white sm:text-xs">
              {adLabel}
            </span>
            <button
              type="button"
              disabled={!canSkip}
              onClick={finish}
              className="pointer-events-auto rounded-md bg-black/75 px-3 py-1.5 text-xs font-bold text-white shadow ring-1 ring-white/25 transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
            >
              {canSkip
                ? isAr
                  ? "تخطي الإعلان ›"
                  : "Skip Ad ›"
                : isAr
                  ? `تخطي بعد ${Math.max(secondsLeft, 1)}`
                  : `Skip in ${Math.max(secondsLeft, 1)}`}
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
            <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-white/75 sm:text-xs">
              {isAr
                ? "إعلان داخل المشغّل — يمكنك التخطي بعد العدّاد"
                : "In-player ad — skip after the countdown"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function shouldPlayVastPreroll() {
  if (isBrowserSearchCrawler()) return false;
  return isExoclickVastEnabled();
}

type InPlayerVastGateProps = {
  children: ReactNode;
  sessionKey: string;
  prerollKey: string;
  poster?: string;
};

const CLOCK_PREFIX = "mv-vast-clock:";

function readAdClock(sessionKey: string): number | null {
  try {
    const n = Number(sessionStorage.getItem(CLOCK_PREFIX + sessionKey));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeAdClock(sessionKey: string) {
  try {
    sessionStorage.setItem(CLOCK_PREFIX + sessionKey, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function InPlayerVastGate({ children, sessionKey, poster }: InPlayerVastGateProps) {
  const enabled = shouldPlayVastPreroll();
  const [prerollDone, setPrerollDone] = useState(!enabled);
  const [midrollKey, setMidrollKey] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);
  const lastSessionRef = useRef(sessionKey);

  useEffect(() => {
    if (!shouldPlayVastPreroll()) {
      setPrerollDone(true);
      setMidrollKey(0);
      lastSessionRef.current = sessionKey;
      return;
    }
    if (lastSessionRef.current !== sessionKey) {
      lastSessionRef.current = sessionKey;
      setPrerollDone(false);
      setMidrollKey(0);
    }
  }, [sessionKey]);

  function pauseContent() {
    const root = shellRef.current;
    if (!root) return;
    root.querySelectorAll("video").forEach((video) => {
      try {
        video.pause();
      } catch {
        /* ignore */
      }
    });
  }

  function resumeContent() {
    const root = shellRef.current;
    if (!root) return;
    root.querySelectorAll("video").forEach((video) => {
      try {
        void video.play();
      } catch {
        /* ignore */
      }
    });
  }

  function onPrerollDone() {
    writeAdClock(sessionKey);
    setPrerollDone(true);
  }

  function onMidrollDone() {
    writeAdClock(sessionKey);
    setMidrollKey(0);
    resumeContent();
  }

  useEffect(() => {
    if (prerollDone && sessionKey && !readAdClock(sessionKey)) {
      writeAdClock(sessionKey);
    }
  }, [prerollDone, sessionKey]);

  useEffect(() => {
    if (!prerollDone || midrollKey > 0 || !enabled) return;
    const last = readAdClock(sessionKey) ?? Date.now();
    const remaining = Math.max(250, MIDROLL_EVERY_MS - (Date.now() - last));
    const timer = window.setTimeout(() => setMidrollKey((n) => n + 1), remaining);
    return () => window.clearTimeout(timer);
  }, [prerollDone, midrollKey, enabled, sessionKey]);

  useEffect(() => {
    if (midrollKey > 0) pauseContent();
  }, [midrollKey]);

  const showMidroll = midrollKey > 0 && enabled;
  const showPreroll = !prerollDone && enabled;

  return (
    <div ref={shellRef} className="relative aspect-video w-full">
      <div
        className={
          showPreroll || showMidroll
            ? "invisible pointer-events-none relative h-full w-full"
            : "relative h-full w-full"
        }
      >
        {prerollDone ? children : null}
      </div>
      {showPreroll && (
        <VastPreroll key={`vast-${sessionKey}`} poster={poster} fill onDone={onPrerollDone} />
      )}
      {showMidroll && (
        <VastPreroll
          key={`midroll-${sessionKey}-${midrollKey}`}
          poster={poster}
          fill
          autoPlayMuted
          onDone={onMidrollDone}
        />
      )}
    </div>
  );
}
