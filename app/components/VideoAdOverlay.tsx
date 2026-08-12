"use client";

import { useEffect } from "react";

interface Props {
  onPhaseChange?: (phase: "idle" | "playing" | "done") => void;
}

/** Ads disabled — skip overlay and signal done to parent. */
export default function VideoAdOverlay({ onPhaseChange }: Props) {
  useEffect(() => {
    onPhaseChange?.("done");
  }, [onPhaseChange]);

  return null;
}
