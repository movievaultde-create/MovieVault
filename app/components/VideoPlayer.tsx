"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

function getSourceType(src: string): string {
  const normalized = src.split("?")[0].toLowerCase();
  if (normalized.endsWith(".m3u8")) return "application/x-mpegURL";
  if (normalized.endsWith(".mpd")) return "application/dash+xml";
  return "video/mp4";
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js")["default"]> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let player: ReturnType<typeof import("video.js")["default"]> | null = null;

    const init = async () => {
      if (!videoRef.current) return;

      const videojs = (await import("video.js")).default;

      if (!document.querySelector('link[href*="video-js.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://vjs.zencdn.net/8.10.0/video-js.css";
        document.head.appendChild(link);
      }

      player = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      });

      playerRef.current = player;
      setReady(true);
    };

    const timer = setTimeout(init, 500);

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div ref={containerRef} className="player-shell relative w-full">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
          poster={poster}
        >
          <source src={src} type={getSourceType(src)} />
        </video>
      </div>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
