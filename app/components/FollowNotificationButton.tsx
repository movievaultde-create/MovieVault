"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

type FollowType = "movie" | "tv";

export default function FollowNotificationButton({
  type,
  itemId,
  title,
  isAr,
}: {
  type: FollowType;
  itemId: number;
  title: string;
  isAr: boolean;
}) {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      follow: isAr
        ? type === "tv"
          ? "تابع تنبيهات الحلقات"
          : "نبّهني عند BluRay"
        : type === "tv"
          ? "Follow episode alerts"
          : "Notify me on BluRay",
      unfollow: isAr ? "إلغاء التنبيه" : "Stop alerts",
      needLogin: isAr ? "سجل الدخول أولاً" : "Login first",
    }),
    [isAr, type]
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !itemId) return;
    fetch(
      `/api/notifications/follow?email=${encodeURIComponent(user.email)}&type=${type}&id=${itemId}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; following?: boolean } | null) => {
        if (data?.ok) setFollowing(Boolean(data.following));
      })
      .catch(() => setFollowing(false));
  }, [isAuthenticated, itemId, type, user?.email]);

  const toggle = async () => {
    if (!isAuthenticated || !user?.email) {
      alert(text.needLogin);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        const res = await fetch("/api/notifications/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, type, id: itemId }),
        });
        if (res.ok) setFollowing(false);
      } else {
        const res = await fetch("/api/notifications/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, type, id: itemId, title }),
        });
        if (res.ok) setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
        following
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-600"
          : "btn-ghost !rounded-xl !px-4 !py-2 !text-xs"
      }`}
    >
      {loading ? "..." : following ? text.unfollow : text.follow}
    </button>
  );
}
