import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../services/app.js";

export function createInitMiddleware(
  variables: AppEnv["Variables"],
): MiddlewareHandler {
  return async (context, next) => {
    for (const [key, value] of Object.entries(variables)) {
      context.set(key, value);
    }
    await next();
  };
}
