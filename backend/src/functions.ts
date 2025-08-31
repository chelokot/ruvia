import { onRequest, type Request as CFRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { buildApp } from "./services/app.js";

// Declare deployed secrets
export const FAL_KEY = defineSecret("FAL_KEY");
export const ANDROID_PACKAGE_NAME = defineSecret("ANDROID_PACKAGE_NAME");

export const api = onRequest({ secrets: [FAL_KEY, ANDROID_PACKAGE_NAME] }, async (req: CFRequest, res) => {
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

