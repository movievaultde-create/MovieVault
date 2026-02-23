"use client";

import { useEffect, useRef, useState } from "react";

// HilltopAds VAST tag URL
export const HILLTOP_VAST_URL =
  "https://shiny-fortune.com/d.mHF/zHdDGqNDvrZYGNUk/beXmD9EuDZeUelRkwPjTjY_4JMojhEnzZOUDgkytWNCjjgDyBMoTzMS5wMEy/Z/siaWWC1Wp/doDc0cxy";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  vastUrl?: string;
}

function getSourceType(src: string): string {
  const normalized = src.split("?")[0].toLowerCase();
  if (normalized.endsWith(".m3u8")) return "application/x-mpegURL";
  if (normalized.endsWith(".mpd")) return "application/dash+xml";
  return "video/mp4";
}

export default function VideoPlayer({ src, poster, vastUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js")["default"]> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let player: ReturnType<typeof import("video.js")["default"]> | null = null;

    const init = async () => {
      if (!videoRef.current) return;

      const videojs = (await import("video.js")).default;

      // Load Video.js CSS
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

      // VAST/VPAID ad integration
      const adTag = vastUrl || HILLTOP_VAST_URL;
      if (adTag && adTag !== "YOUR_HILLTOP_VAST_TAG_URL_HERE") {
        loadVastAd(player, adTag);
      }
    };

    // Delay initialization slightly for better page load
    const timer = setTimeout(init, 500);

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch {}
        playerRef.current = null;
      }
    };
  }, [src, vastUrl]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-black">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-dark"
          playsInline
          poster={poster}
        >
          <source src={src} type={getSourceType(src)} />
        </video>
      </div>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

function loadVastAd(
  player: ReturnType<typeof import("video.js")["default"]>,
  vastUrl: string
) {
  // Load IMA SDK for VAST/VPAID support
  if (!document.querySelector('script[src*="ima3.js"]')) {
    const script = document.createElement("script");
    script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
    script.async = true;
    script.onload = () => initIma(player, vastUrl);
    document.head.appendChild(script);
  } else {
    initIma(player, vastUrl);
  }
}

function initIma(
  player: ReturnType<typeof import("video.js")["default"]>,
  vastUrl: string
) {
  const w = window as typeof window & { google?: { ima?: unknown } };
  if (!w.google?.ima) return;

  try {
    const google = w.google as {
      ima: {
        AdDisplayContainer: new (el: Element, vid: HTMLVideoElement) => { initialize: () => void };
        AdsLoader: new (container: { initialize: () => void }) => {
          addEventListener: (event: unknown, fn: (e: { getAdsManager: (vid: HTMLVideoElement, settings: unknown) => { init: (w: number, h: number, mode: unknown) => void; start: () => void; addEventListener: (event: unknown, fn: () => void) => void } }) => void) => void;
          requestAds: (req: unknown) => void;
        };
        AdsRequest: new () => { adTagUrl: string; linearAdSlotWidth: number; linearAdSlotHeight: number };
        AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: unknown } };
        AdEvent: { Type: { ALL_ADS_COMPLETED: unknown; COMPLETE: unknown } };
        ViewMode: { NORMAL: unknown };
        AdsRenderingSettings: new () => unknown;
      };
    };

    const videoEl = player.el().querySelector("video") as HTMLVideoElement;
    if (!videoEl) return;

    const adContainer = document.createElement("div");
    adContainer.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;";
    player.el().appendChild(adContainer);

    const adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoEl);
    adDisplayContainer.initialize();

    const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = vastUrl;
    adsRequest.linearAdSlotWidth = videoEl.clientWidth || 640;
    adsRequest.linearAdSlotHeight = videoEl.clientHeight || 360;

    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      (e) => {
        const adsManager = e.getAdsManager(videoEl, new google.ima.AdsRenderingSettings());
        adsManager.init(videoEl.clientWidth || 640, videoEl.clientHeight || 360, google.ima.ViewMode.NORMAL);
        adsManager.start();
        adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
          adContainer.style.pointerEvents = "none";
        });
        adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
          adContainer.style.pointerEvents = "none";
        });
      }
    );

    player.on("play", () => {
      try { adsLoader.requestAds(adsRequest); } catch {}
    });
  } catch {
    // IMA not available
  }
}
