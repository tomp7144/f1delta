import crypto from "node:crypto";

function res(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function safeCompare(a, b) {
  try {
    return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export default async (req) => {
  if (req.method !== "POST") return res(405, { error: "method_not_allowed" });

  const { CF_API_TOKEN, CF_ZONE_ID, PURGE_SECRET } = process.env;
  if (!CF_API_TOKEN || !CF_ZONE_ID || !PURGE_SECRET) {
    console.error("purge-cache: missing required env vars (CF_API_TOKEN, CF_ZONE_ID, PURGE_SECRET)");
    return res(500, { error: "misconfigured" });
  }

  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!safeCompare(key, PURGE_SECRET)) return res(401, { error: "unauthorized" });

  let cfRes, data;
  try {
    cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purge_everything: true }),
      }
    );
    data = await cfRes.json();
  } catch (err) {
    console.error("purge-cache: fetch failed:", err.message);
    return res(502, { error: "cloudflare_unreachable" });
  }

  if (!data.success) {
    console.error("purge-cache: Cloudflare error", cfRes.status, JSON.stringify(data.errors));
    return res(502, { error: "cloudflare_error", errors: data.errors });
  }

  console.log("purge-cache: success, id", data.result?.id);
  return res(200, { purged: true, id: data.result?.id ?? null });
};

export const config = { path: "/.netlify/functions/purge-cache" };
