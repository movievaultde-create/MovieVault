"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAdUrl } from "../lib/ads";
import { useVip } from "../context/VipContext";

const PRE_ROLL_WAIT = 7;
const MID_ROLL_INTERVAL = 15 * 60 * 1000;
const MID_ROLL_WAIT = 5;

interface VideoAdOverlayProps {
  onReady?: () => void;
}

export default function VideoAdOverlay({ onReady }: VideoAdOverlayProps) {
  const { isVip } = useVip();
  const [phase, setPhase] = useState<"preroll" | "playing" | "midroll">("preroll");
  const [countdown, setCountdown] = useState(PRE_ROLL_WAIT);
  const [adOpened, setAdOpened] = useState(false);
  const midrollTimer = useRef<ReturnType<typeof setInterval>>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);

  // Skip all ads for VIP
  useEffect(() => {
    if (isVip) {
      setPhase("playing");
      onReady?.();
    }
  }, [isVip, onReady]);

  // Pre-roll countdown
  useEffect(() => {
    if (isVip || phase !== "preroll") return;

    setCountdown(PRE_ROLL_WAIT);
    setAdOpened(false);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isVip, phase]);

  // Mid-roll timer
  useEffect(() => {
    if (isVip || phase !== "playing") return;

    midrollTimer.current = setInterval(() => {
      setPhase("midroll");
    }, MID_ROLL_INTERVAL);

    return () => {
      if (midrollTimer.current) clearInterval(midrollTimer.current);
    };
  }, [isVip, phase]);

  // Mid-roll countdown
  useEffect(() => {
    if (phase !== "midroll") return;

    setCountdown(MID_ROLL_WAIT);
    setAdOpened(false);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [phase]);

  const handleAdClick = useCallback(() => {
    if (!adOpened) {
      window.open(getAdUrl(), "_blank");
      try { window.focus(); } catch {}
      setAdOpened(true);
    }
  }, [adOpened]);

  const handleSkip = useCallback(() => {
    setPhase("playing");
    onReady?.();
  }, [onReady]);

  if (isVip || phase === "playing") return null;

  const isPreroll = phase === "preroll";
  const canSkip = countdown === 0;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Ad badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
          AD
        </span>
        {!canSkip && (
          <span className="text-xs text-gray-400">
            {countdown}s
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 sm:h-20 sm:w-20">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#e50914" className="sm:h-10 sm:w-10">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-lg font-bold text-white sm:text-xl">
            {isPreroll ? "Your movie will start shortly" : "Ad Break"}
          </h3>
          <p className="mt-1.5 text-sm text-gray-400">
            {isPreroll
              ? "Please watch this short ad to support free streaming"
              : "A short break — your movie will resume automatically"
            }
          </p>
        </div>

        {/* Ad button */}
        <button
          onClick={handleAdClick}
          className={`rounded-xl px-8 py-3.5 text-sm font-bold transition-all ${
            adOpened
              ? "border border-green-500/30 bg-green-500/10 text-green-400"
              : "bg-gradient-to-r from-primary to-red-700 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          }`}
        >
          {adOpened ? "✓ Ad Viewed" : "Watch Ad"}
        </button>

        {/* Skip / countdown */}
        {canSkip ? (
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            {isPreroll ? "Start Watching" : "Continue Watching"}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="#e50914" strokeWidth="3"
                  strokeDasharray={`${(1 - countdown / (isPreroll ? PRE_ROLL_WAIT : MID_ROLL_WAIT)) * 94.2} 94.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {countdown}
              </span>
            </div>
            <span className="text-xs text-gray-500">Skip available soon</span>
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{
            width: `${(1 - countdown / (isPreroll ? PRE_ROLL_WAIT : MID_ROLL_WAIT)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
