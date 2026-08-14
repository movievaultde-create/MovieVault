"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { useLang } from "../context/LanguageContext";
import { detectAdBlock } from "../lib/detectAdBlock";
import { isBrowserSearchCrawler } from "../lib/isSearchCrawler";

/** MovieVault glassy orange — matches vault/reel copper accent. */
const ORANGE_DEEP = "#ea580c";
const ORANGE_GLOW = "rgba(249, 115, 22, 0.55)";

function copy(isAr: boolean) {
  if (isAr) {
    return {
      title: "الموقع مقفل",
      body: "أوقف مانع الإعلانات على هذا الموقع ثم اضغط متابعة.",
      button: "أوقفته — متابعة",
    };
  }
  return {
    title: "Site locked",
    body: "Turn off your ad blocker for this site, then tap Continue.",
    button: "I turned it off — continue",
  };
}

function CenterLockIcon() {
  return (
    <svg viewBox="0 0 80 80" className="h-28 w-28 text-white drop-shadow-lg" aria-hidden>
      <rect x="18" y="36" width="44" height="34" rx="8" fill="currentColor" />
      <path
        d="M28 36V26a12 12 0 0 1 24 0v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="40" cy="52" r="5" fill="#1a0f08" />
      <rect x="38" y="52" width="4" height="10" rx="2" fill="#1a0f08" />
    </svg>
  );
}

/** Full-site wall when an ad blocker is on. Same layout as Watch Clash Anime, MovieVault orange. */
export default function AntiAdblock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAr } = useLang();
  const [blocked, setBlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const text = copy(isAr);

  function startVideo() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    if (video.paused) void video.play().catch(() => undefined);
  }

  useEffect(() => {
    setMounted(true);
    const warmup = document.createElement("video");
    warmup.muted = true;
    warmup.preload = "auto";
    warmup.src = "/lock-bg.mp4";
    warmup.load();
  }, []);

  useEffect(() => {
    if (isBrowserSearchCrawler()) return;
    if (searchParams.get("embed") === "1") return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    let cancelled = false;
    let timer = 0;
    let running = false;

    const clearWall = () => {
      setBlocked(false);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    const run = async () => {
      if (running) return;
      running = true;
      try {
        const found = await detectAdBlock();
        if (cancelled) return;
        if (found) {
          setBlocked(true);
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
        } else {
          clearWall();
        }
      } catch {
        if (!cancelled) clearWall();
      } finally {
        running = false;
      }
    };

    // Wait briefly so Monetag can paint; if ads show, we never lock.
    const boot = window.setTimeout(() => {
      void run();
    }, 1500);
    timer = window.setInterval(() => {
      void run();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(boot);
      window.clearInterval(timer);
      clearWall();
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!blocked) return;
    startVideo();
    const video = videoRef.current;
    if (!video) return;
    const kick = () => startVideo();
    video.addEventListener("loadeddata", kick);
    video.addEventListener("canplay", kick);
    const retry = window.setInterval(() => {
      if (video.paused) startVideo();
    }, 400);
    return () => {
      video.removeEventListener("loadeddata", kick);
      video.removeEventListener("canplay", kick);
      window.clearInterval(retry);
    };
  }, [blocked]);

  if (!mounted || !blocked) return null;

  return createPortal(
    <div
      data-site-chrome
      data-site-ui="1"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="mv-lock-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483646,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#05070d",
        padding: 16,
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/lock-bg.jpg"
        src="/lock-bg.mp4"
        onLoadedData={startVideo}
        onCanPlay={startVideo}
        onError={() => {
          const video = videoRef.current;
          if (video) video.style.display = "none";
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          backgroundColor: "#05070d",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            margin: "0 auto 20px",
            display: "flex",
            height: 128,
            width: 128,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            background: `linear-gradient(145deg, rgba(249,115,22,0.92) 0%, ${ORANGE_DEEP} 55%, rgba(194,65,12,0.95) 100%)`,
            boxShadow: `0 16px 40px ${ORANGE_GLOW}, inset 0 1px 0 rgba(255,255,255,0.35)`,
            border: "1px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <CenterLockIcon />
        </div>
        <h1 id="mv-lock-title" className="text-2xl font-black text-white sm:text-3xl">
          {text.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">{text.body}</p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold text-white hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, rgba(249,115,22,0.95) 0%, ${ORANGE_DEEP} 100%)`,
            boxShadow: `0 10px 28px ${ORANGE_GLOW}`,
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => window.location.reload()}
        >
          {text.button}
        </button>
      </div>
    </div>,
    document.body,
  );
}
