import { Hono } from "hono";
import type { AuthorizedAppEnv } from "../services/app.js";
import { consumeProductPurchase, verifyProductPurchase } from "../services/play.js";

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

    const body = await c.req.json<{ sku?: string; purchaseToken?: string }>().catch(() => null);
    const sku = body?.sku?.trim() || "";
    const token = body?.purchaseToken?.trim() || "";
    if (!sku || !token) return c.json({ ok: false, error: "invalid body" }, 400);
    if (!Object.prototype.hasOwnProperty.call(SKU_TO_CREDITS, sku)) return c.json({ ok: false, error: "unsupported sku" }, 400);

    const credits = SKU_TO_CREDITS[sku];

    // Idempotency: check purchases collection by purchaseToken
    const firestore = c.var.db.user.firestore;
    const purchaseRef = firestore.collection("purchases").doc(token);
    const existing = await purchaseRef.get();
    if (existing.exists) {
      // Already processed
      const userRef = c.var.db.user.doc(c.var.user.firebaseId);
      const snap = await userRef.get();
      const credits = (snap.data() as any)?.credits ?? 0;
      return c.json({ ok: true, credits, alreadyProcessed: true });
    }

    // Verify with Google Play
    try {
      const res: any = await verifyProductPurchase({ packageName: pkg, productId: sku, token });
      // purchaseState: 0 (purchased), 1 (canceled), 2 (pending)
      if (res.purchaseState !== 0) return c.json({ ok: false, error: "purchase not completed" }, 400);
      // Optional: developerPayload / obfuscatedAccountId check could be added later
    } catch (e) {
      return c.json({ ok: false, error: "verification failed" }, 400);
    }

    // Credit user and record purchase atomically
    const userRef = c.var.db.user.doc(c.var.user.firebaseId);
    await firestore.runTransaction(async (tx) => {
      const u = await tx.get(userRef);
      if (!u.exists) throw new Error("user not found");
      const currentCredits = typeof (u.data() as any)?.credits === "number" ? (u.data() as any).credits : 0;
      tx.update(userRef, { credits: currentCredits + credits });
      tx.set(purchaseRef, {
        uid: c.var.user.firebaseId,
        sku,
        credits,
        createdAt: new Date().toISOString(),
      });
    });

    // Consume the purchase so it can be bought again
    try {
      await consumeProductPurchase({ packageName: pkg, productId: sku, token });
    } catch (e) {
      // Log and continue; reconciliation job could retry
      console.warn("Failed to consume purchase", e);
    }

    const newSnap = await userRef.get();
    const newCredits = (newSnap.data() as any)?.credits ?? 0;
    return c.json({ ok: true, credits: newCredits });
  },
);
