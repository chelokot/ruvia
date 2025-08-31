import { handle } from 'hono/vercel';
import { buildApp } from '../src/services/app.js';

export const config = {
  runtime: 'nodejs',
};

const app = buildApp();

export default function handler(req: any, res: any) {
  const h = handle(app);
  // @ts-expect-error hono/vercel types are edge-first; node adapts at runtime
  return h(req, res);
}

