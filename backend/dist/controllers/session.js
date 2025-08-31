import { Hono } from 'hono';
export function createSessionController(deps) {
    const controller = new Hono();
    controller.use('*', deps.authMiddleware);
    controller.post('/', async (context) => {
        console.log('session controller');
        return context.json({ ok: true });
    });
    return controller;
}
