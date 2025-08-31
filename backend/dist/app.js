import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import {} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin, getAdminApp } from './firebaseAdmin.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createSessionController } from './controllers/session.js';
export function initApp() {
    const adminApp = initFirebaseAdmin() || getAdminApp();
    const deps = { auth: getAuth(adminApp) };
    const app = new Hono();
    const authMiddleware = createAuthMiddleware({ auth: deps.auth });
    const sessionController = createSessionController({ authMiddleware });
    app.route('/session', sessionController);
    const startApp = () => {
        serve({ fetch: app.fetch, port: 3000 }, (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        });
    };
    return { startApp, adminApp, auth: deps.auth };
}
