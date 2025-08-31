import { serve } from "@hono/node-server";
import type { Auth } from "firebase-admin/auth";
import { type Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { createInitMiddleware } from "../middleware/init.js";
import { generateRoute } from "../routes/generate.js";
import { sessionRoute } from "../routes/session.js";
import { type Database, initDatabaseClient } from "./database.js";
import { initFirebase, injectFirebaseCredentials } from "./firebase.js";
import type { User } from "./user.js";
import { purchaseRoute } from "../routes/purchase.js";

export type AppEnv<C = Record<string, unknown>> = {
  Variables: C & {
    auth: Auth;
    db: Database;
  };
};
export type AuthorizedAppEnv = AppEnv<{
  user: User;
}>;

export type AppContext = Context<AppEnv>;
export type AuthorizedAppContext = Context<AuthorizedAppEnv>;

export function buildApp() {
  const auth = initFirebase();
  const db = initDatabaseClient();

  const variables: AppEnv["Variables"] = { auth, db };

  const app = new Hono<AppEnv>()
    .use("*", createInitMiddleware(variables))
    .use("*", authMiddleware);

  app.route("/session", sessionRoute);
  app.route("/generate", generateRoute);
  app.route("/purchase", purchaseRoute);

  return app;
}

export async function initApp() {
  await injectFirebaseCredentials();

  const app = buildApp();

  return () => {
    serve({ fetch: app.fetch, port: 3000 }, (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    });
  };
}
