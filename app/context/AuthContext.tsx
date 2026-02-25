"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const SESSION_KEY = "mv_auth_session";

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseSession(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.email || !parsed.name || !parsed.createdAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    const sessionUser = parseSession(raw);
    if (!sessionUser) {
      localStorage.removeItem(SESSION_KEY);
      setLoading(false);
      return;
    }
    fetch(`/api/auth/me?email=${encodeURIComponent(sessionUser.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.user) {
          setUser(data.user);
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      signup: async (name: string, email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const trimmedName = name.trim();
        const safePassword = password.trim();

        if (!trimmedName) return { ok: false, error: "name_required" };
        if (!normalizedEmail || !normalizedEmail.includes("@")) return { ok: false, error: "invalid_email" };
        if (safePassword.length < 6) return { ok: false, error: "password_short" };

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: normalizedEmail,
            password: safePassword,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; user?: AuthUser };
        if (!res.ok || !data.ok || !data.user) {
          return { ok: false, error: data.error ?? "signup_failed" };
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return { ok: true };
      },
      login: async (email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const safePassword = password.trim();
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: safePassword,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; user?: AuthUser };
        if (!res.ok || !data.ok || !data.user) {
          return { ok: false, error: data.error ?? "login_failed" };
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return { ok: true };
      },
      logout: () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
