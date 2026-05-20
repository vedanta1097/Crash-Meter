import { NextResponse } from "next/server";

const FRED_KEY = process.env.FRED_API_KEY;
const BASE = "https://api.stlouisfed.org/fred/series/observations";

async function fetchSeries(seriesId: string) {
  const url = `${BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FRED error for ${seriesId}: ${res.status}`);
  const data = await res.json();
  const obs = data.observations?.find(
    (o: { value: string }) => o.value !== ".",
  );
  return {
    value: obs ? parseFloat(parseFloat(obs.value).toFixed(2)) : null,
    date: obs?.date ?? null,
  };
}

async function fetchVelocity(seriesId: string) {
  const url = `${BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=200`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FRED velocity error: ${res.status}`);
  const data = await res.json();
  const obs: Array<{ value: string; date: string }> = data.observations ?? [];

  const latest = obs.find((o) => o.value !== ".");
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const old = obs
    .filter((o) => o.value !== "." && new Date(o.date) <= sixMonthsAgo)
    .at(0);

  // Convert percent → basis points (1% = 100 bps), rounded to nearest bps
  const latestBps = latest ? Math.round(parseFloat(latest.value) * 100) : null;
  const oldBps = old ? Math.round(parseFloat(old.value) * 100) : null;

  return {
    latest: latestBps,
    latestDate: latest?.date ?? null,
    sixMonthAgo: oldBps,
    sixMonthAgoDate: old?.date ?? null,
  };
}

export async function GET() {
  try {
    const [t10y3m, hyOas] = await Promise.all([
      fetchSeries("T10Y3M"),
      fetchVelocity("BAMLH0A0HYM2"),
    ]);

    const velocityBps =
      hyOas.latest != null && hyOas.sixMonthAgo != null
        ? Math.abs(hyOas.latest - hyOas.sixMonthAgo)
        : null;

    return NextResponse.json({
      t10y3m,
      hyOas: {
        // All values in basis points (bps)
        value: hyOas.latest, // e.g. 282 bps  (threshold: < 550 bps)
        date: hyOas.latestDate,
        sixMonthAgo: hyOas.sixMonthAgo,
        sixMonthAgoDate: hyOas.sixMonthAgoDate,
        velocity: velocityBps, // 6-month range in bps (threshold: < 150 bps)
        aboveThreshold: {
          value: hyOas.latest != null ? hyOas.latest > 550 : null, // B2
          velocity: velocityBps != null ? velocityBps > 150 : null, // B1
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
