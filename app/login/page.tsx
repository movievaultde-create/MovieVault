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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface/70 p-7 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-white">{text.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{text.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">{text.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">{text.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40"
              dir="ltr"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "..." : text.submit}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          {text.noAccount}{" "}
          <Link href="/signup" className="font-bold text-primary hover:text-primary-hover">
            {text.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
