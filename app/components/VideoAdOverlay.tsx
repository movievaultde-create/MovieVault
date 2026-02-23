"use client";

import { useState, useEffect, useCallback } from "react";
import { triggerPopunder } from "../lib/ads";

const MID_ROLL_INTERVAL = 15 * 60 * 1000;

interface Props {
  onPhaseChange?: (isAd: boolean) => void;
}

export default function VideoAdOverlay({ onPhaseChange }: Props) {
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const notifyParent = useCallback(
    (isAd: boolean) => {
      onPhaseChange?.(isAd);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Hide iframe until user presses Start.
  useEffect(() => {
    notifyParent(!started);
  }, [started, notifyParent]);

  // During watching: trigger ad every 15 minutes (no on-screen overlay).
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      triggerPopunder();
    }, MID_ROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [started]);

  const handleStart = () => {
    const opened = triggerPopunder({ force: true });
    if (!opened) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setStarted(true);
  };

  if (started) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.85)",
      }}
    >
      <button
        onClick={handleStart}
        style={{
          padding: "12px 22px",
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(135deg, #e50914, #b91c1c)",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(229,9,20,0.25)",
        }}
      >
        ▶ Start
      </button>
      {blocked && (
        <p
          style={{
            position: "absolute",
            bottom: 22,
            margin: 0,
            color: "#fbbf24",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          Popup was blocked. Disable popup blocker and press Start again.
        </p>
      )}
    </div>
  );
}
