import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function GET() {
  try {
    // Use the table page which has server-rendered data (no JS needed)
    const res = await fetch(
      "https://www.multpl.com/shiller-pe/table/by-month",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Crashmeter/1.0)",
          Accept: "text/html",
        },
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) throw new Error(`multpl.com returned ${res.status}`);

    const html = await res.text();
    const root = parse(html);

    // Parse first data row from the table
    const rows = root.querySelectorAll("table#datatable tr");
    let value: number | null = null;
    let date: string | null = null;

    // Try #datatable first, fall back to any table row
    const dataRows = rows.length > 1 ? rows : root.querySelectorAll("table tr");

    for (const row of dataRows) {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        const rawDate = cells[0]?.text?.trim();
        const rawValue = cells[1]?.text?.trim();
        const parsed = parseFloat(rawValue?.replace(/[^0-9.]/g, "") ?? "");
        if (!isNaN(parsed)) {
          value = parsed;
          date = rawDate ?? null;
          break;
        }
      }
    }

    if (value === null) throw new Error("Could not parse CAPE from table page");

    return NextResponse.json({ value, date });
  } catch (err) {
    console.error("CAPE scrape error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
