import "dotenv/config";
import { onRequest, type Request as CFRequest } from "firebase-functions/v2/https";
import { buildApp } from "./services/app.js";

export const api = onRequest(async (req: CFRequest, res) => {
  try {
    const app = buildApp();
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers.host as string) || "localhost";
    const url = `${proto}://${host}${req.originalUrl || req.url}`;

    const request = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : (req as any).rawBody,
    });

    const response = await app.fetch(request);
    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const buf = Buffer.from(await response.arrayBuffer());
    res.send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});
