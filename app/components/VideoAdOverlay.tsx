"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { triggerPopunder, triggerStartAd } from "../lib/ads";

const MID_ROLL_INTERVAL = 15 * 60 * 1000;

interface Props {
  onPhaseChange?: (isAd: boolean) => void;
}

export default function VideoAdOverlay({ onPhaseChange }: Props) {
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [pendingReturn, setPendingReturn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const leftPageRef = useRef(false);

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

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(ua) || navigator.maxTouchPoints > 1;
    setIsMobile(mobile);
  }, []);

  // During watching: trigger ad every 15 minutes (no on-screen overlay).
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      triggerPopunder();
    }, MID_ROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [started]);

  // Require user to return after opening ad page.
  useEffect(() => {
    if (!pendingReturn) return;

    const finish = () => {
      setPendingReturn(false);
      setStarted(true);
    };

    const onBlur = () => {
      leftPageRef.current = true;
    };

    const onFocus = () => {
      if (leftPageRef.current) finish();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        leftPageRef.current = true;
      } else if (document.visibilityState === "visible" && leftPageRef.current) {
        finish();
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pendingReturn]);

  const handleStart = () => {
    const opened = triggerStartAd();
    if (!opened) {
      if (isMobile) {
        // Mobile browsers often block popups even on tap; don't dead-end playback.
        setStarted(true);
        setPendingReturn(false);
        setBlocked(false);
        return;
      }
      setBlocked(true);
      return;
    }
    leftPageRef.current = false;
    setBlocked(false);
    setPendingReturn(true);
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
      {pendingReturn && (
        <p
          style={{
            position: "absolute",
            bottom: 44,
            margin: 0,
            color: "#9ca3af",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          Ad opened. Return to this page to continue watching.
        </p>
      )}
      {blocked && (
        <div
          style={{
            position: "absolute",
            bottom: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#fbbf24",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Popup was blocked. Disable popup blocker and press Start again.
          </p>
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Continue Watching
          </button>
        </div>
      )}
    </div>
  );
}
