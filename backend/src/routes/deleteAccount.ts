import { Hono } from 'hono';
import type { AppEnv } from '../services/app.js';

export const deleteAccountRoute = new Hono<AppEnv>().post('/', async (c) => {
  try {
    const body = await c.req.json<{ email?: string }>().catch(() => null);
    const email = (body?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ ok: false, error: 'invalid email' }, 400);
    }
    const col = c.var.db.user.firestore.collection('deletion_requests');
    const ref = col.doc(email);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ email, requestedAt: new Date().toISOString() });
    }
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ ok: false, error: 'unexpected' }, 500);
  }
});

