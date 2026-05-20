# Crashmeter v3

Dashboard otomatis untuk memantau skor risiko pasar berdasarkan metodologi Crashmeter v3.

## Run lokal

```bash
npm install
npm run dev
# buka http://localhost:3000
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di vercel.com → New Project
3. Tambah environment variable:
   - Key: `FRED_API_KEY`
   - Value: (isi API key FRED kamu)
4. Deploy

## Data sources

| Parameter | Sumber | Cache |
|-----------|--------|-------|
| T10Y-3M Yield Curve | FRED API | 1 jam |
| HY OAS + Velocity 6bln | FRED API | 1 jam |
| Shiller CAPE | multpl.com | 24 jam |
