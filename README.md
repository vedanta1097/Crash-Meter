# Crashmeter v3

An automated market crash risk dashboard based on the Crashmeter v3 methodology — built with Next.js, fetching live data from FRED (Federal Reserve) and Shiller CAPE (multpl.com).

> **Current score (as of May 2026): 2 / 4 — Waspada (Caution)**

---

## What is Crashmeter?

Crashmeter v3 is a systematic, quantitative framework to assess the risk of a systemic market crash. Rather than reading one analyst who is bearish and another who is bullish and ending up confused, Crashmeter gives you a single number: **0–4**.

| Score | Status                |
| ----- | --------------------- |
| 0–1   | ✅ Aman (Safe)        |
| 2     | ⚠️ Waspada (Caution)  |
| 3     | 🚨 Exit window begins |
| 4     | 🔴 Critical           |

In the 2000 Dotcom crash, the score hit 3 when the S&P 500 had only dropped **3.5% from its peak**. In the 2008 GFC, it was only down **6% from peak**. The exit window is wide — but not forever.

---

## Scoring Parameters

### A — Yield Curve (T10Y-3M) · Max 1 pt

**A1 · Spread T10Y-3M**

The 10-year minus 3-month Treasury yield spread is one of the most academically proven leading indicators of a recession. Think of it like a patient in the ICU: while inverted, the Fed is watching closely (life support). Once the inversion ends, the real test begins — does the patient recover, or relapse?

- Safe if spread **> 0.5** → Score = 0
- Danger if spread **< 0.5** → Score = 1
- Current: **0.77** → Score = 0

**A2 · Has 18 months passed since the last inversion ended?**

18 months post-inversion is considered the soft-landing threshold. The last inversion ended in **March 2026**, meaning the safe date is **September 2027**. Until then, this parameter stays at 1.

- Auto-calculated from inversion end date
- Current: **not yet passed** → Score = 1

**A combined = min(1, A1 + A2)**

---

### B — HY OAS (High-Yield Credit Spread) · Max 2 pts

HY OAS measures how much extra yield investors demand for junk bonds (non-investment grade corporate debt) over safe US Treasuries. It reflects whether "Big Money" still has appetite for risk — or is quietly heading for the exit.

**B1 · 6-Month Velocity**

If the spread widens more than **150 bps in 6 months**, it signals a rapid deterioration in risk appetite.

- Safe if velocity **≤ 150 bps** → Score = 0
- Danger if velocity **> 150 bps** → Score = 1
- Current: ~20–30 bps → Score = 0

**B2 · Absolute Level**

An HY OAS above **550 bps** historically signals systemic stress.

- Safe if level **≤ 550 bps** → Score = 0
- Danger if level **> 550 bps** → Score = 1
- Current: **282 bps** → Score = 0

> **B is the best early warning for event-driven crashes.** During COVID (Feb 2020), HY OAS spiked sharply before most people acknowledged the threat. If something unexplained is causing a spike — ask yourself why. The exit window in event-driven scenarios can be just days.

---

### C — Shiller CAPE · Max 1 pt

The Cyclically Adjusted Price-to-Earnings ratio (CAPE), adjusted for 10 years of inflation, measures how expensive the market is relative to long-term earnings.

- Safe if CAPE **≤ 35** → Score = 0
- Danger if CAPE **> 35** → Score = 1
- Current: **41.35** → Score = 1

For reference: the Dotcom peak was **44.19**. The current level is psychologically significant.

---

## Why does this matter for non-US investors?

Crashmeter tracks the three most powerful forces in global markets:

1. **Policy maker** (The Fed) — via the Yield Curve
2. **Amplifier** (bad debt) — via HY OAS
3. **Psychology** (market valuation) — via Shiller CAPE

If Crashmeter hits **3**, it tells you whether a downturn is likely to be **L-shaped** (long, systemic — years to recover, like Dotcom 2000: 7 years, GFC 2008: 6 years) or **V-shaped** (fast, non-systemic — like COVID: months).

For emerging markets including IHSG: **every time the US experiences a systemic crash, emerging markets historically outperform significantly during the recovery.**

---

## Limitations

1. **Does not work for event-triggered crashes** (pandemics, geopolitical black swans, nuclear escalation).
2. **Does not work if the problem is outside the system** — e.g., Private Credit.

For these cases, monitor HY OAS velocity in real time and act fast. The window can be days.

---

## Data Sources

| Parameter             | Source                 | Refresh        |
| --------------------- | ---------------------- | -------------- |
| T10Y-3M               | FRED (Federal Reserve) | Every hour     |
| HY OAS (BAMLH0A0HYM2) | FRED (Federal Reserve) | Every hour     |
| Shiller CAPE          | multpl.com (scraped)   | Every 24 hours |

---

## Running Locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di vercel.com → New Project
3. Tambah environment variable:
   - Key: `FRED_API_KEY`
   - Value: (isi API key FRED kamu)
4. Deploy

## Data sources

| Parameter              | Sumber     | Cache  |
| ---------------------- | ---------- | ------ |
| T10Y-3M Yield Curve    | FRED API   | 1 jam  |
| HY OAS + Velocity 6bln | FRED API   | 1 jam  |
| Shiller CAPE           | multpl.com | 24 jam |
