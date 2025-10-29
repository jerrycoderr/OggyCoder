export default async function handler(req, res) {
  try {
    const targetUrl = "https://jerrycoder.oggyapi.workers.dev" + req.url; // <— here it appends /tool/web2zip etc.
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const data = await r.arrayBuffer();
    res.setHeader("content-type", r.headers.get("content-type") || "text/plain");
    res.status(r.status).send(Buffer.from(data));
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
}
