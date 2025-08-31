import { handle } from 'hono/vercel';
// Import built server app from backend build output
// Ensure `npm run build:backend:vercel` runs before bundling
import { buildApp } from '../backend/dist/services/app.js';

export const config = {
  runtime: 'nodejs',
};

const app = buildApp();

export default function handler(req: any, res: any) {
  const h = handle(app);
  // hono/vercel types are edge-first; node adapts at runtime
  // @ts-expect-error type mismatch between edge/node handled by hono
  return h(req, res);
}
