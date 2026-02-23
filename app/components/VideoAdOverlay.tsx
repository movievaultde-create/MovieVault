"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { triggerPopunder } from "../lib/ads";

const PRE_ROLL_WAIT = 7;
const MID_ROLL_INTERVAL = 15 * 60 * 1000;
const MID_ROLL_WAIT = 5;

interface Props {
  onPhaseChange?: (isAd: boolean) => void;
}

export default function VideoAdOverlay({ onPhaseChange }: Props) {
  const [phase, setPhase] = useState<"preroll" | "playing" | "midroll">("preroll");
  const [countdown, setCountdown] = useState(PRE_ROLL_WAIT);
  const [adOpened, setAdOpened] = useState(false);
  const midrollTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);

  const notifyParent = useCallback(
    (isAd: boolean) => { onPhaseChange?.(isAd); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Notify parent on phase change
  useEffect(() => {
    notifyParent(phase !== "playing");
  }, [phase, notifyParent]);

  // Pre-roll countdown
  useEffect(() => {
    if (phase !== "preroll") return;

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
  }, [phase]);

  // Mid-roll timer
  useEffect(() => {
    if (phase !== "playing") return;

    midrollTimer.current = setTimeout(() => {
      setPhase("midroll");
    }, MID_ROLL_INTERVAL);

    return () => {
      if (midrollTimer.current) clearTimeout(midrollTimer.current);
    };
  }, [phase]);

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
      triggerPopunder();
      setAdOpened(true);
    }
  };

  const handleSkip = () => {
    // Require ad interaction before continuing.
    if (!adOpened) {
      triggerPopunder();
      setAdOpened(true);
      return;
    }
    setPhase("playing");
  };

  if (phase === "playing") return null;

  const isPreroll = phase === "preroll";
  const canSkip = countdown === 0;
  const canContinue = canSkip && adOpened;
  const totalTime = isPreroll ? PRE_ROLL_WAIT : MID_ROLL_WAIT;
  const progress = (1 - countdown / totalTime) * 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.97)",
      }}
    >
      {/* AD badge */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            background: "#f59e0b",
            color: "#000",
            fontWeight: 700,
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          AD
        </span>
        {!canSkip && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{countdown}s</span>
        )}
      </div>

      {/* Skip button (top-right) */}
      {canSkip && (
        <button
          onClick={handleSkip}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            color: canContinue ? "#fff" : "#d1d5db",
            background: canContinue ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
            border: canContinue ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          {canContinue ? (isPreroll ? "▶ Start" : "▶ Continue") : "Watch ad first"}
        </button>
      )}

      {/* Center content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "0 24px", textAlign: "center" }}>
        {/* Countdown circle */}
        <div style={{ position: "relative", width: 88, height: 88 }}>
          <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="16" fill="none" stroke="#e50914" strokeWidth="2.5"
              strokeDasharray={`${progress * 1.005} 100.5`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {canSkip ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#e50914">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            ) : (
              <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{countdown}</span>
            )}
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
            {isPreroll ? "Your movie starts in a moment" : "Short ad break"}
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
            Support free streaming
          </p>
        </div>

        {/* Ad button */}
        <button
          onClick={handleAdClick}
          style={{
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 700,
            border: adOpened ? "1px solid rgba(34,197,94,0.3)" : "none",
            borderRadius: 12,
            cursor: "pointer",
            background: adOpened
              ? "rgba(34,197,94,0.1)"
              : "linear-gradient(135deg, #e50914, #b91c1c)",
            color: adOpened ? "#4ade80" : "#fff",
            boxShadow: adOpened ? "none" : "0 4px 20px rgba(229,9,20,0.25)",
          }}
        >
          {adOpened ? "✓ Ad Viewed — Thank you!" : "Watch Ad"}
        </button>
        {canSkip && !adOpened && (
          <p style={{ margin: 0, fontSize: 12, color: "#f59e0b" }}>
            Please open ad once to continue playback
          </p>
        )}
      </div>

      {/* Bottom progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.05)" }}>
        <div
          style={{
            height: "100%",
            background: "#e50914",
            width: `${progress}%`,
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
}
