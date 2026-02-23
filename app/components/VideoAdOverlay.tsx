"use client";

import { useState, useEffect, useRef } from "react";
import { getAdUrl } from "../lib/ads";
import { useVip } from "../context/VipContext";

const PRE_ROLL_WAIT = 7;
const MID_ROLL_INTERVAL = 15 * 60 * 1000;
const MID_ROLL_WAIT = 5;

export default function VideoAdOverlay() {
  const { isVip } = useVip();
  const [phase, setPhase] = useState<"preroll" | "playing" | "midroll">(isVip ? "playing" : "preroll");
  const [countdown, setCountdown] = useState(PRE_ROLL_WAIT);
  const [adOpened, setAdOpened] = useState(false);
  const midrollTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

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

  // Start mid-roll timer when playing
  useEffect(() => {
    if (isVip || phase !== "playing") return;

    midrollTimer.current = setTimeout(() => {
      if (mounted.current) setPhase("midroll");
    }, MID_ROLL_INTERVAL);

    return () => {
      if (midrollTimer.current) clearTimeout(midrollTimer.current);
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

  const handleAdClick = () => {
    if (!adOpened) {
      window.open(getAdUrl(), "_blank");
      try { window.focus(); } catch {}
      setAdOpened(true);
    }
  };

  const handleSkip = () => {
    setPhase("playing");
  };

  if (isVip || phase === "playing") return null;

  const isPreroll = phase === "preroll";
  const canSkip = countdown === 0;
  const totalTime = isPreroll ? PRE_ROLL_WAIT : MID_ROLL_WAIT;
  const progress = (1 - countdown / totalTime) * 100;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95">
      {/* AD badge + countdown */}
      <div className="absolute top-3 left-3 flex items-center gap-2 sm:top-4 sm:left-4">
        <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
          AD
        </span>
        {!canSkip && (
          <span className="text-xs text-gray-400">{countdown}s</span>
        )}
      </div>

      {/* Skip button top-right when ready */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:top-4 sm:right-4 sm:text-sm"
        >
          {isPreroll ? "▶ Start" : "▶ Continue"}
        </button>
      )}

      {/* Center content */}
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        {/* Animated circle */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="16" fill="none" stroke="#e50914" strokeWidth="2.5"
              strokeDasharray={`${progress * 1.005} 100.5`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {canSkip ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#e50914">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            ) : (
              <span className="text-2xl font-extrabold text-white sm:text-3xl">{countdown}</span>
            )}
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-bold text-white sm:text-lg">
            {isPreroll ? "Your movie starts in a moment" : "Short ad break"}
          </h3>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Support free streaming
          </p>
        </div>

        {/* Ad button */}
        <button
          onClick={handleAdClick}
          className={`rounded-xl px-6 py-3 text-sm font-bold transition-all sm:px-8 ${
            adOpened
              ? "border border-green-500/30 bg-green-500/10 text-green-400"
              : "bg-gradient-to-r from-primary to-red-700 text-white shadow-lg shadow-primary/25 hover:shadow-xl"
          }`}
        >
          {adOpened ? "✓ Ad Viewed — Thank you!" : "Watch Ad"}
        </button>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
