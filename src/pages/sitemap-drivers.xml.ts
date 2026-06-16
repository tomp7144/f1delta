import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

export const prerender = true;

export const GET: APIRoute = () => {
  const drivers: { id: string }[] = JSON.parse(
    fs.readFileSync(path.resolve("./data/f1db/f1db-drivers.json"), "utf8")
  );
  const urls = drivers
    .map((d) => `  <url><loc>https://f1delta.com/driver?d=${d.id}</loc></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
