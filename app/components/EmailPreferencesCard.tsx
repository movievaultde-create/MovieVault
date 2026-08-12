"use client";

import { useEffect, useMemo, useState } from "react";

type Preferences = {
  isActive: boolean;
  wantsNewReleases: boolean;
  wantsVipUpdates: boolean;
};

export default function EmailPreferencesCard({
  email,
  name,
  isAr,
}: {
  email: string;
  name: string;
  isAr: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    isActive: true,
    wantsNewReleases: true,
    wantsVipUpdates: true,
  });

  const text = useMemo(
    () => ({
      title: isAr ? "رسائل البريد" : "Email Updates",
      subtitle: isAr
        ? "استقبل إيميل عند نجاح الاشتراك وعند نزول فيلم/مسلسل جديد."
        : "Receive email on successful subscription and new releases.",
      active: isAr ? "الاشتراك بالبريد" : "Email subscription",
      movies: isAr ? "أفلام/مسلسلات جديدة" : "New movies & series",
      vip: isAr ? "تنبيهات VIP" : "VIP updates",
      on: isAr ? "مفعل" : "On",
      off: isAr ? "مغلق" : "Off",
      saved: isAr ? "تم الحفظ" : "Saved",
    }),
    [isAr]
  );

  useEffect(() => {
    fetch(`/api/email/preferences?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; preferences?: Preferences } | null) => {
        if (data?.ok && data.preferences) {
          setPrefs(data.preferences);
        }
      })
      .catch(() => {
        // no-op
      });
  }, [email]);

  const save = async (next: Preferences) => {
    setLoading(true);
    setPrefs(next);
    try {
      const res = await fetch("/api/email/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          subscribed: next.isActive,
          wantsNewReleases: next.wantsNewReleases,
          wantsVipUpdates: next.wantsVipUpdates,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
      <h2 className="text-base font-bold text-[var(--accent)]">{text.title}</h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{text.subtitle}</p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ToggleRow
          label={text.active}
          value={prefs.isActive}
          disabled={loading}
          onChange={(v) => void save({ ...prefs, isActive: v })}
          onLabel={text.on}
          offLabel={text.off}
        />
        <ToggleRow
          label={text.movies}
          value={prefs.wantsNewReleases}
          disabled={loading || !prefs.isActive}
          onChange={(v) => void save({ ...prefs, wantsNewReleases: v })}
          onLabel={text.on}
          offLabel={text.off}
        />
        <ToggleRow
          label={text.vip}
          value={prefs.wantsVipUpdates}
          disabled={loading || !prefs.isActive}
          onChange={(v) => void save({ ...prefs, wantsVipUpdates: v })}
          onLabel={text.on}
          offLabel={text.off}
        />
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-dim)]">{loading ? "..." : text.saved}</p>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3">
      <p className="text-xs font-semibold text-[var(--text-dim)]">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`mt-2 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 disabled:opacity-60 ${
          value ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
        }`}
      >
        <span
          className={`h-5 w-5 shrink-0 rounded-full bg-white shadow-md transition-transform duration-200 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
