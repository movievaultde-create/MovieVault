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
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">{text.confirm}</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
          {text.haveAccount}{" "}
          <Link href="/login" className="font-bold text-primary hover:text-primary-hover">
            {text.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
