import * as Sentry from "@sentry/node";

type RequestContext = {
  userId?: string;
  correlationId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  sku?: string;
  tokenSuffix?: string;
};

type PurchaseStage = {
  stage: string;
  correlationId: string;
  sku?: string;
  tokenSuffix?: string;
  status?: string;
  error?: string;
  extra?: Record<string, unknown>;
  userId?: string;
};

let enabled = false;

function readDsn() {
  return (process.env.SENTRY_DSN ?? "").trim();
}

function readEnvironment() {
  const env = (process.env.SENTRY_ENVIRONMENT ?? "").trim();
  if (env) return env;
  const nodeEnv = (process.env.NODE_ENV ?? "").trim();
  if (nodeEnv) return nodeEnv;
  return "production";
}

function readTraceRate() {
  const raw = (process.env.SENTRY_TRACE_RATE ?? "").trim();
  const value = Number.parseFloat(raw);
  if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
  return 1;
}

export function initMonitoring() {
  if (enabled) return true;
  const dsn = readDsn();
  if (!dsn) return false;
  Sentry.init({ dsn, environment: readEnvironment(), tracesSampleRate: readTraceRate() });
  enabled = true;
  return true;
}

export function isMonitoringEnabled() {
  return enabled;
}

export function createCorrelationId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function withRequestScope<T>(context: RequestContext, run: () => Promise<T>) {
  if (!enabled) return run();
  return Sentry.withScope(async (scope) => {
    if (context.correlationId) scope.setTag("purchaseCorrelationId", context.correlationId);
    if (context.userId) scope.setUser({ id: context.userId });
    if (context.requestId) scope.setTag("requestId", context.requestId);
    if (context.method) scope.setTag("requestMethod", context.method);
    if (context.path) scope.setTag("requestPath", context.path);
    if (context.sku) scope.setTag("purchaseSku", context.sku);
    if (context.tokenSuffix) scope.setExtra("purchaseTokenSuffix", context.tokenSuffix);
    try {
      return await run();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });
}

export function logPurchaseStage(stage: PurchaseStage) {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    scope.setTag("purchaseStage", stage.stage);
    scope.setTag("purchaseCorrelationId", stage.correlationId);
    if (stage.userId) scope.setUser({ id: stage.userId });
    if (stage.sku) scope.setTag("purchaseSku", stage.sku);
    if (stage.status) scope.setTag("purchaseStatus", stage.status);
    if (stage.tokenSuffix) scope.setExtra("purchaseTokenSuffix", stage.tokenSuffix);
    if (stage.extra) scope.setContext("purchaseContext", stage.extra);
    if (stage.error) scope.setExtra("purchaseError", stage.error);
    Sentry.addBreadcrumb({ category: "purchase", message: stage.stage, data: { correlationId: stage.correlationId, sku: stage.sku, tokenSuffix: stage.tokenSuffix, status: stage.status } });
    Sentry.captureMessage(`purchase.${stage.stage}`, stage.error ? "error" : "info");
  });
}

export function captureMonitoringError(error: unknown, extras?: Record<string, unknown>, correlationId?: string, userId?: string) {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    if (correlationId) scope.setTag("purchaseCorrelationId", correlationId);
    if (userId) scope.setUser({ id: userId });
    if (extras) scope.setContext("extraContext", extras);
    Sentry.captureException(error);
  });
}

initMonitoring();
