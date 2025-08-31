import type { Next } from "hono";
import type { AuthorizedAppContext } from "../services/app.js";
import { findUserAndUpdate } from "../services/user.js";

export async function authMiddleware(
  context: AuthorizedAppContext,
  next: Next,
) {
  const idToken = context.req.header("authorization") || "";
  if (!idToken) {
    return context.json({ ok: false }, 400);
  }

  try {
    const decodedToken = await context.var.auth.verifyIdToken(idToken);
    const user = await findUserAndUpdate({
      db: context.var.db,
      firebaseId: decodedToken.uid,
      name: decodedToken.name,
    });
    context.set("user", user);
    await next();
  } catch {
    return context.json({ ok: false }, 401);
  }
}
