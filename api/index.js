export default async function handler(req, res) {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.status(204).end();
    return;
  }

  try {
    const targetUrl = "https://jerrycoder.oggyapi.workers.dev" + req.url;

    // ✅ Proxy request to target
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        'accept-encoding': 'identity', // Prevent double compression
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // ✅ Copy & sanitize response headers
    const headers = {};
    for (const [key, value] of r.headers.entries()) {
      const lower = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding"].includes(lower)) {
        headers[key] = value;
      }
    }

    // ✅ Add CORS + CDN-safe headers
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
    headers["Cache-Control"] = "no-transform";
    headers["Content-Encoding"] = "identity";
    headers["Accept-Ranges"] = "bytes";

    // ✅ Send response
    const buffer = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, headers);
    res.end(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
}
