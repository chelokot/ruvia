import type { Next } from "hono";
import type { AppContext, AuthorizedAppContext } from "../services/app.js";
import { isMonitoringEnabled, withRequestScope } from "../services/monitoring.js";

type Ctx = AppContext | AuthorizedAppContext;

export async function monitoringMiddleware(context: Ctx, next: Next) {
  if (!isMonitoringEnabled()) {
    await next();
    return;
  }
  const correlationId = (context.req.header("x-correlation-id") ?? "").trim() || undefined;
  const requestId = (context.req.header("x-request-id") ?? "").trim() || undefined;
  const userId = ((context.var as Record<string, unknown>).user as { firebaseId?: string } | undefined)?.firebaseId;
  await withRequestScope(
    {
      correlationId,
      requestId,
      method: context.req.method,
      path: context.req.path,
      userId,
    },
    async () => {
      await next();
    },
  );
}
