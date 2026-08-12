"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setVipMode } from "../lib/ads";
import { setHilltopVipMuted } from "../lib/hilltopads";

interface VipContextType {
  isVip: boolean;
  vipEmail: string | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const VipContext = createContext<VipContextType | null>(null);

const STORAGE_KEY = "mv_vip_email";

export function VipProvider({ children }: { children: ReactNode }) {
  const [vipEmail, setVipEmail] = useState<string | null>(null);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      verify(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVipMode(isVip);
    setHilltopVipMuted(isVip);
  }, [isVip]);

  async function verify(email: string): Promise<boolean> {
    try {
      const res = await fetch("/api/vip/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.valid) {
        setVipEmail(email);
        setIsVip(true);
        localStorage.setItem(STORAGE_KEY, email);
        return true;
      } else {
        setVipEmail(null);
        setIsVip(false);
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
    } catch {
      return false;
    }
  }

  async function login(email: string): Promise<boolean> {
    return verify(email);
  }

  function logout() {
    setVipEmail(null);
    setIsVip(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <VipContext.Provider value={{ isVip, vipEmail, login, logout }}>
      {children}
    </VipContext.Provider>
  );
}

export function useVip() {
  const ctx = useContext(VipContext);
  if (!ctx) throw new Error("useVip must be inside VipProvider");
  return ctx;
}
