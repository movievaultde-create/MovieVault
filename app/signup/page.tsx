"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { isAr } = useLang();
  const { isAuthenticated, loading: authLoading, signup } = useAuth();
  const { login: vipLogin } = useVip();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      title: isAr ? "إنشاء حساب" : "Create Account",
      subtitle: isAr ? "سجل الآن للوصول إلى VIP والمحتوى المميز" : "Sign up now to unlock VIP and premium content",
      name: isAr ? "الاسم" : "Name",
      email: isAr ? "البريد الإلكتروني" : "Email",
      password: isAr ? "كلمة المرور" : "Password",
      confirm: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
      submit: isAr ? "تسجيل" : "Sign up",
      haveAccount: isAr ? "لديك حساب بالفعل؟" : "Already have an account?",
      login: isAr ? "تسجيل الدخول" : "Login",
      mismatch: isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
      short: isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
      exists: isAr ? "البريد مستخدم مسبقًا" : "Email already exists",
      invalid: isAr ? "بيانات غير صالحة" : "Invalid data",
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
    if (password.trim().length < 6) {
      setError(text.short);
      return;
    }
    if (password !== confirm) {
      setError(text.mismatch);
      return;
    }
    setLoading(true);
    setError("");
    const result = await signup(name, email, password);
    if (!result.ok) {
      setLoading(false);
      if (result.error === "email_exists") {
        setError(text.exists);
      } else if (result.error === "db_not_configured") {
        setError(text.db);
      } else {
        setError(text.invalid);
      }
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
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">{text.name}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40"
            />
          </div>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pe-11 text-sm text-white outline-none transition focus:border-primary/40"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">{text.confirm}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pe-11 text-sm text-white outline-none transition focus:border-primary/40"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
          {text.haveAccount}{" "}
          <Link href="/login" className="font-bold text-primary hover:text-primary-hover">
            {text.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
