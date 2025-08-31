import fsp from "node:fs/promises";
import path from "node:path";
import type * as firebase from "firebase-admin";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export function initFirebase(): firebase.auth.Auth {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const hasExplicitCreds = !!(projectId && clientEmail && privateKey);

  const app = getApps().length
    ? undefined
    : initializeApp(
        emulatorHost
          ? {
              credential: cert({
                projectId: projectId || "demo-project",
                clientEmail: clientEmail || "demo@example.com",
                privateKey: privateKey || "noop",
              }),
              projectId,
            }
          : hasExplicitCreds
            ? { credential: cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! }), projectId }
            : { credential: applicationDefault(), projectId },
      );

  return getAuth();
}

export async function injectFirebaseCredentials() {
  const data = await fsp.readFile(
    path.join(process.cwd(), "firebase-service.json"),
  );
  const parsed = JSON.parse(data.toString());
  process.env.FIREBASE_PROJECT_ID = parsed.project_id;
  process.env.FIREBASE_CLIENT_EMAIL = parsed.client_email;
  process.env.FIREBASE_PRIVATE_KEY = parsed.private_key;
}
