"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
}

const USERS_KEY = "mv_auth_users";
const SESSION_KEY = "mv_auth_session";

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return;
    const users = readUsers();
    const found = users.find((u) => u.email === normalizeEmail(email));
    if (found) {
      setUser({ name: found.name, email: found.email, createdAt: found.createdAt });
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signup: (name: string, email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const trimmedName = name.trim();
        const safePassword = password.trim();

        if (!trimmedName) return { ok: false, error: "name_required" };
        if (!normalizedEmail || !normalizedEmail.includes("@")) return { ok: false, error: "invalid_email" };
        if (safePassword.length < 6) return { ok: false, error: "password_short" };

        const users = readUsers();
        const exists = users.some((u) => u.email === normalizedEmail);
        if (exists) return { ok: false, error: "email_exists" };

        const createdAt = new Date().toISOString();
        const newUser: StoredUser = {
          name: trimmedName,
          email: normalizedEmail,
          password: safePassword,
          createdAt,
        };
        const nextUsers = [...users, newUser];
        writeUsers(nextUsers);
        localStorage.setItem(SESSION_KEY, normalizedEmail);
        setUser({ name: trimmedName, email: normalizedEmail, createdAt });
        return { ok: true };
      },
      login: (email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const safePassword = password.trim();
        const users = readUsers();
        const found = users.find((u) => u.email === normalizedEmail);
        if (!found) return { ok: false, error: "user_not_found" };
        if (found.password !== safePassword) return { ok: false, error: "invalid_credentials" };

        localStorage.setItem(SESSION_KEY, normalizedEmail);
        setUser({ name: found.name, email: found.email, createdAt: found.createdAt });
        return { ok: true };
      },
      logout: () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
