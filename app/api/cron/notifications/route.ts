import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { isWebPushConfigured, sendWebPush } from "../../../lib/webPush";
import { isEmailConfigured, sendEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";

type PushPayload = {
  title: string;
  body: string;
  url: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

type BrowseDigestItem = {
  id: number;
  title: string;
  year: string;
  type: "movie" | "tv";
};

function isAuthorized(req: NextRequest): boolean {
  const vercelCronHeader = req.headers.get("x-vercel-cron");
  if (vercelCronHeader) return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

async function fetchTmdb(path: string) {
  const res = await fetch(`${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function markSubscriptionInactive(supabase: ReturnType<typeof getSupabaseAdmin>, endpoint: string) {
  await supabase
    .from("app_push_subscriptions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("endpoint", endpoint);
}

async function sendToUser(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  email: string,
  eventKey: string,
  eventType: string,
  payload: PushPayload
): Promise<boolean> {
  const { error: logError } = await supabase
    .from("app_notify_events_log")
    .insert({ user_email: email, event_key: eventKey, event_type: eventType });
  if (logError) return false;

  const { data: subs, error: subsError } = await supabase
    .from("app_push_subscriptions")
    .select("endpoint,p256dh,auth")
    .eq("user_email", email)
    .eq("is_active", true);
  if (subsError || !subs || subs.length === 0) return false;

  let delivered = false;
  for (const sub of subs) {
    const result = await sendWebPush(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    );

    if (result.ok) delivered = true;
    if (!result.ok && (result.statusCode === 404 || result.statusCode === 410)) {
      await markSubscriptionInactive(supabase, sub.endpoint);
    }
  }

  return delivered;
}

async function sendDailyReleaseEmails(
  req: NextRequest,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<number> {
  if (!isEmailConfigured()) return 0;

  const browseRes = await fetch(`${req.nextUrl.origin}/api/browse?lang=en-US`, { cache: "no-store" });
  if (!browseRes.ok) return 0;
  const browseData = (await browseRes.json()) as {
    dailyDigest?: {
      date?: string;
      movies?: BrowseDigestItem[];
      series?: BrowseDigestItem[];
    };
  };

  const dateKey = browseData.dailyDigest?.date ?? new Date().toISOString().slice(0, 10);
  const movies = (browseData.dailyDigest?.movies ?? []).slice(0, 3);
  const series = (browseData.dailyDigest?.series ?? []).slice(0, 3);
  if (movies.length === 0 && series.length === 0) return 0;

  const eventKey = `daily_email_releases:${dateKey}`;
  const { error: eventError } = await supabase
    .from("app_email_events_log")
    .insert({ event_key: eventKey, event_type: "daily_releases" });

  if (eventError) {
    const duplicate = "code" in eventError && eventError.code === "23505";
    if (duplicate) return 0;
    return 0;
  }

  const { data: subscribers, error: subscribersError } = await supabase
    .from("app_email_subscribers")
    .select("email,name")
    .eq("is_active", true)
    .eq("wants_new_releases", true);
  if (subscribersError || !subscribers || subscribers.length === 0) return 0;

  const movieLines = movies.map((item) => `- ${item.title} (${item.year || "N/A"})`).join("<br/>");
  const seriesLines = series.map((item) => `- ${item.title} (${item.year || "N/A"})`).join("<br/>");
  const textMovieLines = movies.map((item) => `- ${item.title} (${item.year || "N/A"})`).join("\n");
  const textSeriesLines = series.map((item) => `- ${item.title} (${item.year || "N/A"})`).join("\n");

  let sent = 0;
  for (const subscriber of subscribers) {
    const ok = await sendEmail({
      to: subscriber.email,
      subject: "MovieVault daily new releases",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>New releases are live today</h2>
          <p>Hello ${subscriber.name?.trim() || "there"}, here is your daily update:</p>
          <h3>Movies</h3>
          <p>${movieLines || "No movie updates today."}</p>
          <h3>Series</h3>
          <p>${seriesLines || "No series updates today."}</p>
          <p><a href="${req.nextUrl.origin}" target="_blank" rel="noopener">Open MovieVault</a></p>
        </div>
      `,
      text: `New releases are live today.\n\nMovies:\n${textMovieLines || "No movie updates today."}\n\nSeries:\n${textSeriesLines || "No series updates today."}\n\n${req.nextUrl.origin}`,
    });
    if (ok) sent += 1;
  }

  return sent;
}

function isRecentDate(value: string | undefined, days: number): boolean {
  if (!value) return false;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= days * 24 * 60 * 60 * 1000;
}

async function runNotifications(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!TMDB_KEY) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }
  const pushEnabled = isWebPushConfigured();

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
  }

  let pushSent = 0;

  const { data: seriesFollows } = await supabase
    .from("app_notify_series_follows")
    .select("user_email,tv_id,title");

  const groupedSeries = new Map<number, Array<{ user_email: string; title: string }>>();
  for (const follow of seriesFollows ?? []) {
    const tvId = Number(follow.tv_id);
    if (!groupedSeries.has(tvId)) groupedSeries.set(tvId, []);
    groupedSeries.get(tvId)!.push({ user_email: follow.user_email, title: follow.title });
  }

  for (const [tvId, users] of groupedSeries.entries()) {
    const data = await fetchTmdb(`/tv/${tvId}?language=en-US`);
    const last = data?.last_episode_to_air as
      | { season_number?: number; episode_number?: number; air_date?: string; name?: string }
      | undefined;
    if (!last?.season_number || !last?.episode_number || !isRecentDate(last.air_date, 5)) continue;

    const eventKey = `tv:${tvId}:s${last.season_number}e${last.episode_number}`;
    const title = data?.name || users[0]?.title || `TV #${tvId}`;
    for (const user of users) {
      const delivered = pushEnabled
        ? await sendToUser(supabase, user.user_email, eventKey, "new_episode", {
        title: "New Episode Available",
        body: `${title} S${last.season_number}E${last.episode_number} is now available.`,
        url: `/watch/tv/${tvId}`,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: eventKey,
      })
        : false;
      if (delivered) pushSent += 1;
    }
  }

  const { data: movieAlerts } = await supabase
    .from("app_notify_movie_alerts")
    .select("user_email,movie_id,title");

  const groupedMovies = new Map<number, Array<{ user_email: string; title: string }>>();
  for (const alert of movieAlerts ?? []) {
    const movieId = Number(alert.movie_id);
    if (!groupedMovies.has(movieId)) groupedMovies.set(movieId, []);
    groupedMovies.get(movieId)!.push({ user_email: alert.user_email, title: alert.title });
  }

  for (const [movieId, users] of groupedMovies.entries()) {
    const releaseData = await fetchTmdb(`/movie/${movieId}/release_dates`);
    const releaseRows: Array<{ type?: number; release_date?: string }> =
      releaseData?.results?.flatMap((country: { release_dates?: Array<{ type?: number; release_date?: string }> }) => country.release_dates ?? []) ??
      [];
    const hasPhysicalRelease = releaseRows.some((row) => row.type === 5 && isRecentDate(row.release_date, 45));
    if (!hasPhysicalRelease) continue;

    const eventKey = `movie:${movieId}:bluray`;
    const title = users[0]?.title || `Movie #${movieId}`;
    for (const user of users) {
      const delivered = pushEnabled
        ? await sendToUser(supabase, user.user_email, eventKey, "bluray", {
        title: "BluRay Released",
        body: `${title} is now available in BluRay quality.`,
        url: `/watch/${movieId}`,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: eventKey,
      })
        : false;
      if (delivered) pushSent += 1;
    }
  }

  const emailSent = await sendDailyReleaseEmails(req, supabase);
  return NextResponse.json({ ok: true, pushSent, emailSent, sent: pushSent + emailSent });
}

export async function POST(req: NextRequest) {
  return runNotifications(req);
}

export async function GET(req: NextRequest) {
  return runNotifications(req);
}
