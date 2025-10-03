import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';
import type { Scope } from '@sentry/types';

type PurchaseStage = {
  stage: string;
  correlationId: string;
  sku?: string;
  tokenSuffix?: string;
  status?: string;
  error?: string;
  extra?: Record<string, unknown>;
};

type UserIdentity = {
  id: string;
  email?: string;
  name?: string;
};

let initialized = false;

function readDsn() {
  return (process.env.EXPO_PUBLIC_SENTRY_DSN ?? '').trim();
}

function readEnvironment() {
  const env = (process.env.EXPO_PUBLIC_ENVIRONMENT ?? '').trim();
  if (env) return env;
  const configEnv = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.environment;
  if (typeof configEnv === 'string' && configEnv.trim()) return configEnv.trim();
  return 'production';
}

function readTraceRate() {
  const raw = (process.env.EXPO_PUBLIC_SENTRY_TRACE_RATE ?? '').trim();
  const value = Number.parseFloat(raw);
  if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
  return 1;
}

export function initMonitoring() {
  if (initialized) return;
  const dsn = readDsn();
  if (!dsn) return;
  Sentry.init({
    dsn,
    enableInExpoDevelopment: true,
    environment: readEnvironment(),
    debug: false,
    tracesSampleRate: readTraceRate(),
    enableNative: true,
    enableOutOfMemoryTracking: true,
  });
  initialized = true;
}

export function setMonitoringUser(user: UserIdentity | null) {
  if (!initialized) return;
  if (user) {
    Sentry.Native.setUser({ id: user.id, email: user.email, username: user.name });
  } else {
    Sentry.Native.setUser(null);
  }
}

function applyScope(scope: Scope, stage: PurchaseStage) {
  scope.setTag('purchaseStage', stage.stage);
  scope.setTag('purchaseCorrelationId', stage.correlationId);
  if (stage.sku) scope.setTag('purchaseSku', stage.sku);
  if (stage.status) scope.setTag('purchaseStatus', stage.status);
  if (stage.tokenSuffix) scope.setExtra('purchaseTokenSuffix', stage.tokenSuffix);
  if (stage.extra) scope.setContext('purchaseContext', stage.extra);
}

export function logPurchaseStage(stage: PurchaseStage) {
  if (!initialized) return stage.correlationId;
  Sentry.Native.addBreadcrumb({ category: 'purchase', message: stage.stage, data: { correlationId: stage.correlationId, sku: stage.sku, status: stage.status, tokenSuffix: stage.tokenSuffix } });
  Sentry.Native.withScope((scope) => {
    applyScope(scope, stage);
    if (stage.error) scope.setExtra('purchaseError', stage.error);
    Sentry.Native.captureMessage(`purchase.${stage.stage}`, stage.error ? 'error' : 'info');
  });
  return stage.correlationId;
}

export function captureMonitoringError(error: unknown, extra?: Record<string, unknown>, correlationId?: string) {
  if (!initialized) return;
  Sentry.Native.withScope((scope) => {
    if (correlationId) scope.setTag('purchaseCorrelationId', correlationId);
    if (extra) scope.setContext('extraContext', extra);
    Sentry.Native.captureException(error);
  });
}

export function createCorrelationId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function beginPurchaseFlow(sku: string) {
  const correlationId = createCorrelationId();
  logPurchaseStage({ stage: 'started', correlationId, sku });
  return correlationId;
}
