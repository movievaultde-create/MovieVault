"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { isAr } = useLang();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const { login: vipLogin } = useVip();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      title: isAr ? "تسجيل الدخول" : "Login",
      subtitle: isAr ? "ادخل لحسابك للوصول للمحتوى والمزايا" : "Sign in to access your content and benefits",
      email: isAr ? "البريد الإلكتروني" : "Email",
      password: isAr ? "كلمة المرور" : "Password",
      submit: isAr ? "دخول" : "Login",
      noAccount: isAr ? "ليس لديك حساب؟" : "Don't have an account?",
      signup: isAr ? "إنشاء حساب" : "Sign up",
      invalid: isAr ? "بيانات تسجيل الدخول غير صحيحة" : "Invalid credentials",
      required: isAr ? "أدخل البريد وكلمة المرور" : "Enter email and password",
      db: isAr ? "قاعدة البيانات غير مربوطة بعد. أكمل ربط Supabase." : "Database is not connected yet. Complete Supabase setup.",
    }),
    [isAr],
  );

  if (authLoading) return null;

  if (isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(text.required);
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error === "db_not_configured" ? text.db : text.invalid);
      setLoading(false);
      return;
    }
    await vipLogin(email.trim().toLowerCase());
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 pt-24 pb-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-7 shadow-lg">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{text.title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{text.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-dim)]">{text.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-dim)]">{text.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pe-11"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition hover:text-[var(--text-primary)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.92-2.19 2.44-4.06 4.34-5.44M9.9 4.24A10.92 10.92 0 0112 4c5 0 9.27 3.89 11 8a10.94 10.94 0 01-1.62 2.91M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "..." : text.submit}
          </button>
        </form>

        <p className="mt-5 text-sm text-[var(--text-muted)]">
          {text.noAccount}{" "}
          <Link href="/signup" className="font-bold text-[var(--accent)] hover:text-[var(--accent-bright)]">
            {text.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
