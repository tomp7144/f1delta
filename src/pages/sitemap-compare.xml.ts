import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

export const prerender = true;

export const GET: APIRoute = () => {
  const { drivers }: { drivers: { driverId: string }[] } = JSON.parse(
    fs.readFileSync(path.resolve("./data/drivers/index.json"), "utf8")
  );

  // Collect IDs of drivers with ≥1 win
  const winners: string[] = [];
  for (const d of drivers) {
    try {
      const dj = JSON.parse(
        fs.readFileSync(path.resolve(`./data/drivers/${d.driverId}.json`), "utf8")
      );
      if ((dj.totals?.wins ?? 0) >= 1) winners.push(d.driverId);
    } catch {}
  }
  winners.sort();

  // Emit all canonical pair URLs (i < j → already alphabetically ordered)
  const urls: string[] = [];
  for (let i = 0; i < winners.length; i++) {
    for (let j = i + 1; j < winners.length; j++) {
      urls.push(
        `  <url><loc>https://f1delta.com/compare/${winners[i]}-vs-${winners[j]}</loc></url>`
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
