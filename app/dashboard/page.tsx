"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

export default function DashboardPage() {
  const router = useRouter();
  const { isAr } = useLang();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { isVip, logout: vipLogout } = useVip();
  const [referral, setReferral] = useState<{
    inviteLink: string;
    successfulReferrals: number;
    neededToReward: number;
    rewardsEarned: number;
  } | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  const text = useMemo(
    () => ({
      title: isAr ? "لوحة المستخدم" : "User Dashboard",
      subtitle: isAr ? "إدارة حسابك ومزايا VIP" : "Manage your account and VIP benefits",
      name: isAr ? "الاسم" : "Name",
      email: isAr ? "البريد" : "Email",
      memberSince: isAr ? "تاريخ التسجيل" : "Member Since",
      status: isAr ? "الحالة" : "Status",
      vip: isAr ? "مفعل VIP" : "VIP Active",
      normal: isAr ? "حساب عادي" : "Standard Account",
      upgrade: isAr ? "ترقية إلى VIP" : "Upgrade to VIP",
      watchlist: isAr ? "قائمة المفضلة" : "Watchlist",
      home: isAr ? "الرئيسية" : "Home",
      logout: isAr ? "تسجيل خروج" : "Logout",
      needLogin: isAr ? "يلزم تسجيل الدخول أولًا." : "You need to login first.",
      goLogin: isAr ? "الذهاب لتسجيل الدخول" : "Go to Login",
      inviteTitle: isAr ? "شارك واربح VIP" : "Invite & Earn VIP",
      inviteDesc: isAr ? "ادعُ 5 أصدقاء واحصل على شهر VIP مجاني." : "Invite 5 friends and unlock 1 free VIP month.",
      invited: isAr ? "دعوات ناجحة" : "Successful invites",
      rewards: isAr ? "أشهر مجانية مكتسبة" : "Free months earned",
      left: isAr ? "متبقي للمكافأة التالية" : "Left for next reward",
      copyInvite: isAr ? "نسخ رابط الدعوة" : "Copy invite link",
      copied: isAr ? "تم النسخ" : "Copied",
    }),
    [isAr],
  );

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/referral/me?email=${encodeURIComponent(user.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) {
          setReferral({
            inviteLink: data.inviteLink,
            successfulReferrals: data.successfulReferrals,
            neededToReward: data.neededToReward,
            rewardsEarned: data.rewardsEarned,
          });
        }
      })
      .catch(() => {
        setReferral(null);
      });
  }, [user?.email]);

  if (authLoading) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface/70 p-7 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-white">{text.needLogin}</h1>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {text.goLogin}
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    vipLogout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-24 pb-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 shadow-2xl sm:p-8">
          <h1 className="text-3xl font-extrabold text-white">{text.title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{text.subtitle}</p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label={text.name} value={user.name} />
            <InfoRow label={text.email} value={user.email} />
            <InfoRow
              label={text.memberSince}
              value={new Date(user.createdAt).toLocaleDateString()}
            />
            <InfoRow label={text.status} value={isVip ? text.vip : text.normal} highlight={isVip} />
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h2 className="text-base font-bold text-emerald-300">{text.inviteTitle}</h2>
            <p className="mt-1 text-xs text-emerald-100/90">{text.inviteDesc}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <InfoRow label={text.invited} value={String(referral?.successfulReferrals ?? 0)} />
              <InfoRow label={text.rewards} value={String(referral?.rewardsEarned ?? 0)} />
              <InfoRow label={text.left} value={String(referral?.neededToReward ?? 5)} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={referral?.inviteLink ?? ""}
                readOnly
                className="min-w-[260px] flex-1 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!referral?.inviteLink) return;
                  try {
                    await navigator.clipboard.writeText(referral.inviteLink);
                    setCopyDone(true);
                    setTimeout(() => setCopyDone(false), 2000);
                  } catch {
                    // no-op
                  }
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
              >
                {copyDone ? text.copied : text.copyInvite}
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {!isVip && (
              <Link
                href="/vip"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-black"
              >
                {text.upgrade}
              </Link>
            )}
            <Link
              href="/watchlist"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              {text.watchlist}
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              {text.home}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
            >
              {text.logout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${highlight ? "text-amber-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
