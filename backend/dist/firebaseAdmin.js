import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
export function initFirebaseAdmin() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase admin env is not set');
    }
    if (getApps().length === 0) {
        return initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            projectId
        });
    }
    return getApps()[0];
}
