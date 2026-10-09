"use client";

import { useEffect, useState, useCallback } from "react";

interface FredData {
  t10y3m: { value: number | null; date: string | null };
  hyOas: {
    value: number | null;
    date: string | null;
    sixMonthAgo: number | null;
    sixMonthAgoDate: string | null;
    velocity: number | null;
  };
}

interface CapeData {
  value: number | null;
  date: string | null;
}

type Status = "idle" | "loading" | "ok" | "error";
type BadgeLevel = "safe" | "warn" | "danger" | "neutral";

function Badge({ label, level }: { label: string; level: BadgeLevel }) {
  const styles: Record<BadgeLevel, { bg: string; color: string }> = {
    safe: { bg: "var(--green-bg)", color: "var(--green-text)" },
    warn: { bg: "var(--amber-bg)", color: "var(--amber-text)" },
    danger: { bg: "var(--red-bg)", color: "var(--red-text)" },
    neutral: { bg: "var(--surface2)", color: "var(--text2)" },
  };
  return (
    <span
      style={{
        background: styles[level].bg,
        color: styles[level].color,
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const active = ["#1D9E75", "#EF9F27", "#E24B4A", "#A32D2D"][
    Math.min(score - 1, 3)
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            background: i < score ? active : "var(--border)",
            transition: "background 0.4s",
          }}
        />
      ))}
    </div>
  );
}

function Row({
  label,
  value,
  badge,
  sub,
}: {
  label: string;
  value: string;
  badge: { label: string; level: BadgeLevel };
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
        <Badge label={badge.label} level={badge.level} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text3)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div
      style={{
        height: 16,
        borderRadius: 4,
        background: "var(--surface2)",
        width: "60%",
        display: "inline-block",
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Home() {
  const [fred, setFred] = useState<FredData | null>(null);
  const [cape, setCape] = useState<CapeData | null>(null);
  const [fredStatus, setFredStatus] = useState<Status>("idle");
  const [capeStatus, setCapeStatus] = useState<Status>("idle");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // A2: auto-calculated — inversion ended Dec 2024, safe after 18 months (Jun 2026)
  const inversionEnd = new Date("2024-12-01");
  inversionEnd.setMonth(inversionEnd.getMonth() + 18);
  const a2passed = new Date() >= inversionEnd;

  const fetchData = useCallback(async () => {
    setFredStatus("loading");
    setCapeStatus("loading");
    setLastRefresh(new Date());

    fetch("/api/fred")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFred(data);
        setFredStatus("ok");
      })
      .catch(() => setFredStatus("error"));

    fetch("/api/cape")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCape(data);
        setCapeStatus("ok");
      })
      .catch(() => setCapeStatus("error"));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const t10y3m = fred?.t10y3m.value ?? null;
  const hyOasVal = fred?.hyOas.value ?? null;
  const hyVel = fred?.hyOas.velocity ?? null;
  const capeVal = cape?.value ?? null;

  const a1score = t10y3m != null ? (t10y3m < 0.5 ? 1 : 0) : 0;
  const a2score = a2passed ? 0 : 1;
  const aScore = Math.min(1, a1score + a2score); // A caps at 1
  const b1score = hyVel != null ? (hyVel > 150 ? 1 : 0) : 0;
  const b2score = hyOasVal != null ? (hyOasVal > 550 ? 1 : 0) : 0;
  const cScore = capeVal != null ? (capeVal > 35 ? 1 : 0) : 0;
  const total = aScore + b1score + b2score + cScore; // max 4

  const scoreColor = ["#1D9E75", "#1D9E75", "#EF9F27", "#E24B4A", "#A32D2D"][
    total
  ];

  const statusMap = [
    "✅ Safe",
    "✅ Safe",
    "⚠️ Caution",
    "🚨 Exit window",
    "🔴 Critical",
  ];
  const statusDesc = [
    "Normal conditions; no signs of systemic danger.",
    "Normal conditions; no signs of systemic danger.",
    "One or more parameters have been triggered. Monitor more frequently.",
    "Consider reducing positions gradually.",
    "High risk of a systemic crash. All parameters are active.",
  ];

  function t10y3mBadge(): { label: string; level: BadgeLevel } {
    if (t10y3m == null) return { label: "—", level: "neutral" };
    if (t10y3m < 0.5) return { label: "danger", level: "danger" };
    if (t10y3m < 1) return { label: "caution", level: "warn" };
    return { label: "safe", level: "safe" };
  }

  const isLoading = fredStatus === "loading" || capeStatus === "loading";

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "2rem 1rem" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 2 }}>
            Crashmeter v3
          </h1>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>
            {lastRefresh
              ? `Updated ${lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
              : "Loading data..."}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            fontSize: 13,
            cursor: isLoading ? "not-allowed" : "pointer",
            color: "var(--text2)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={
              isLoading
                ? {
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }
                : {}
            }
          >
            ↻
          </span>
          Refresh
        </button>
      </div>

      {/* Score card */}
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Score
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                lineHeight: 1,
                color: scoreColor,
              }}
            >
              {total}
              <span style={{ fontSize: 18, color: "var(--text3)" }}>/4</span>
            </div>
          )}
          {!isLoading && <ScoreBar score={total} />}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Status
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
                {statusMap[total]}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}
              >
                {statusDesc[total]}
              </div>
            </>
          )}
        </div>
        {!isLoading && (
          <div
            style={{
              gridColumn: "span 2",
              borderTop: "0.5px solid var(--border)",
              paddingTop: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              Breakdown: &nbsp;
              <strong style={{ color: "var(--text)" }}>
                A:{aScore}
              </strong> ·{" "}
              <strong style={{ color: "var(--text)" }}>B1:{b1score}</strong> ·{" "}
              <strong style={{ color: "var(--text)" }}>B2:{b2score}</strong> ·{" "}
              <strong style={{ color: "var(--text)" }}>C:{cScore}</strong>
              &nbsp;=&nbsp;
              <strong style={{ color: scoreColor }}>{total} pts</strong>
            </div>
          </div>
        )}
      </div>

      {/* A — Yield Curve */}
      <Section title="A — Yield Curve (T10Y-3M)">
        {fredStatus === "loading" && (
          <div style={{ padding: "8px 0" }}>
            <Skeleton />
          </div>
        )}
        {fredStatus === "error" && (
          <div
            style={{ fontSize: 13, color: "var(--red-text)", padding: "8px 0" }}
          >
            Failed to load FRED data
          </div>
        )}
        {fredStatus === "ok" && (
          <>
            <Row
              label="A1 · Spread T10Y-3M"
              value={t10y3m != null ? `${t10y3m.toFixed(2)}` : "—"}
              badge={t10y3mBadge()}
              sub={`Data as of ${fmtDate(fred?.t10y3m.date ?? null)} · Safe if > 0.5`}
            />
            <div
              style={{
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>
                  A2 · Has it been 18 months since the inversion ended?
                </div>
                <div
                  style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}
                >
                  Inversion ended Dec 2024 → safe after Jun 2026
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <Badge
                  label={a2passed ? "safe" : "not yet"}
                  level={a2passed ? "safe" : "warn"}
                />
              </div>
            </div>
          </>
        )}
      </Section>

      {/* B — HY OAS */}
      <Section title="B — HY OAS (High-Yield Spread)">
        {fredStatus === "loading" && (
          <div style={{ padding: "8px 0" }}>
            <Skeleton />
          </div>
        )}
        {fredStatus === "error" && (
          <div
            style={{ fontSize: 13, color: "var(--red-text)", padding: "8px 0" }}
          >
            Failed to load FRED data
          </div>
        )}
        {fredStatus === "ok" && (
          <>
            <Row
              label="B1 · Velocity (6-month change)"
              value={hyVel != null ? `${hyVel.toFixed(0)} bps` : "—"}
              badge={
                hyVel == null
                  ? { label: "—", level: "neutral" }
                  : hyVel > 150
                    ? { label: "danger", level: "danger" }
                    : { label: "safe", level: "safe" }
              }
              sub={`${hyOasVal?.toFixed(0) ?? "—"} bps now vs ${fred?.hyOas.sixMonthAgo?.toFixed(0) ?? "—"} bps 6 months ago · Danger if > 150 bps`}
            />
            <Row
              label="B2 · Current HY OAS level"
              value={hyOasVal != null ? `${hyOasVal.toFixed(0)} bps` : "—"}
              badge={
                hyOasVal == null
                  ? { label: "—", level: "neutral" }
                  : hyOasVal > 550
                    ? { label: "danger", level: "danger" }
                    : { label: "safe", level: "safe" }
              }
              sub={`Data as of ${fmtDate(fred?.hyOas.date ?? null)} · Danger if > 550 bps`}
            />
          </>
        )}
      </Section>

      {/* C — Shiller CAPE */}
      <Section title="C — Shiller CAPE (S&P 500)">
        {capeStatus === "loading" && (
          <div style={{ padding: "8px 0" }}>
            <Skeleton />
          </div>
        )}
        {capeStatus === "error" && (
          <div
            style={{ fontSize: 13, color: "var(--red-text)", padding: "8px 0" }}
          >
            Failed to load CAPE data
          </div>
        )}
        {capeStatus === "ok" && (
          <Row
            label="Shiller CAPE ratio"
            value={capeVal != null ? capeVal.toFixed(2) : "—"}
            badge={
              capeVal == null
                ? { label: "—", level: "neutral" }
                : capeVal > 35
                  ? { label: "danger", level: "danger" }
                  : { label: "safe", level: "safe" }
            }
            sub={`Data as of ${cape?.date ?? "—"} · Danger if > 35 · Dotcom peak: 44.19`}
          />
        )}
      </Section>

      {/* Footer */}
      <div
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "var(--text3)",
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        <p>Data sources: FRED (Federal Reserve) · Shiller CAPE (multpl.com)</p>
      </div>
    </main>
  );
}
