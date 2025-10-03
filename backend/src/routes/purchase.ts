import { Hono } from "hono";
import type { AuthorizedAppEnv } from "../services/app.js";
import { consumeProductPurchase, verifyProductPurchase } from "../services/play.js";
import { captureMonitoringError, createCorrelationId, logPurchaseStage } from "../services/monitoring.js";

const SKU_TO_CREDITS: Record<string, number> = {
  ruvia_25_500: 25,
  ruvia_150_2000: 150,
  ruvia_1000_10000: 1000,
};

export const purchaseRoute = new Hono<AuthorizedAppEnv>().post(
  "/",
  async (c) => {
    const pkg = process.env.ANDROID_PACKAGE_NAME;
    if (!pkg) return c.json({ ok: false, error: "server not configured" }, 500);

    const body = await c.req.json<{ sku?: string; purchaseToken?: string; correlationId?: string }>().catch(() => null);
    const sku = body?.sku?.trim() || "";
    const token = body?.purchaseToken?.trim() || "";
    const correlationId = body?.correlationId?.trim() || (c.req.header("x-correlation-id") ?? "").trim() || createCorrelationId();
    const tokenSuffix = token ? token.slice(-12) : undefined;
    const userId = c.var.user.firebaseId;
    logPurchaseStage({ stage: "request_received", correlationId, sku, tokenSuffix, userId });
    if (!sku || !token) return c.json({ ok: false, error: "invalid body", correlationId }, 400);
    if (!Object.prototype.hasOwnProperty.call(SKU_TO_CREDITS, sku)) return c.json({ ok: false, error: "unsupported sku", correlationId }, 400);

    const credits = SKU_TO_CREDITS[sku];

    // Idempotency: check purchases collection by purchaseToken
    const firestore = c.var.db.user.firestore;
    const purchaseRef = firestore.collection("purchases").doc(token);
    const existing = await purchaseRef.get();
    if (existing.exists) {
      // Already processed
      const userRef = c.var.db.user.doc(c.var.user.firebaseId);
      const snap = await userRef.get();
      const balance = (snap.data() as any)?.credits ?? 0;
      logPurchaseStage({ stage: "already_processed", correlationId, sku, tokenSuffix, status: "ok", userId, extra: { credits: balance } });
      return c.json({ ok: true, credits: balance, alreadyProcessed: true, correlationId });
    }

    // Verify with Google Play
    try {
      const res: any = await verifyProductPurchase({ packageName: pkg, productId: sku, token });
      // purchaseState: 0 (purchased), 1 (canceled), 2 (pending)
      if (res.purchaseState !== 0) {
        logPurchaseStage({ stage: "play_not_completed", correlationId, sku, tokenSuffix, status: String(res.purchaseState), userId, extra: { acknowledgementState: res.acknowledgementState } });
        return c.json({ ok: false, error: "purchase not completed", correlationId }, 400);
      }
      logPurchaseStage({ stage: "play_verified", correlationId, sku, tokenSuffix, status: "purchased", userId, extra: { acknowledgementState: res.acknowledgementState } });
      // Optional: developerPayload / obfuscatedAccountId check could be added later
    } catch (e) {
      const err = e as any;
      logPurchaseStage({ stage: "play_verify_failed", correlationId, sku, tokenSuffix, status: String(err?.code ?? err?.response?.status ?? "unknown"), userId, error: err?.message, extra: err?.response?.data ?? err?.errors });
      captureMonitoringError(e, { sku, tokenSuffix, stage: "verifyProductPurchase" }, correlationId, userId);
      return c.json({ ok: false, error: "verification failed", correlationId }, 400);
    }

    // Credit user and record purchase atomically
    const userRef = c.var.db.user.doc(c.var.user.firebaseId);
    let newBalance = 0;
    await firestore.runTransaction(async (tx) => {
      const u = await tx.get(userRef);
      if (!u.exists) throw new Error("user not found");
      const currentCredits = typeof (u.data() as any)?.credits === "number" ? (u.data() as any).credits : 0;
      newBalance = currentCredits + credits;
      tx.update(userRef, { credits: newBalance });
      tx.set(purchaseRef, {
        uid: c.var.user.firebaseId,
        sku,
        credits,
        createdAt: new Date().toISOString(),
      });
    });
    logPurchaseStage({ stage: "credits_applied", correlationId, sku, tokenSuffix, status: "ok", userId, extra: { credits, balance: newBalance } });

    // Consume the purchase so it can be bought again
    try {
      await consumeProductPurchase({ packageName: pkg, productId: sku, token });
      logPurchaseStage({ stage: "play_consumed", correlationId, sku, tokenSuffix, status: "ok", userId });
    } catch (e) {
      // Log and continue; reconciliation job could retry
      logPurchaseStage({ stage: "play_consume_failed", correlationId, sku, tokenSuffix, status: "error", userId, error: (e as any)?.message });
      captureMonitoringError(e, { sku, tokenSuffix, stage: "consumeProductPurchase" }, correlationId, userId);
    }

    const newSnap = await userRef.get();
    const newCredits = (newSnap.data() as any)?.credits ?? 0;
    logPurchaseStage({ stage: "response_sent", correlationId, sku, tokenSuffix, status: "ok", userId, extra: { credits: newCredits } });
    return c.json({ ok: true, credits: newCredits, correlationId });
  },
);
