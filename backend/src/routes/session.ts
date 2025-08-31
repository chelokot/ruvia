import { Hono } from "hono";
import type { AuthorizedAppEnv } from "../services/app.js";

export const sessionRoute = new Hono<AuthorizedAppEnv>().post(
  "/",
  async (context) => {
    return context.json({
      ok: true,
      name: context.var.user.name,
      credits: context.var.user.credits,
    });
  },
);
