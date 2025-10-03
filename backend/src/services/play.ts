import { google } from "googleapis";

const SCOPE = ["https://www.googleapis.com/auth/androidpublisher"];

type ServiceAccountConfig = {
  clientEmail: string;
  privateKey: string;
  projectId?: string;
};

type AndroidPublisherClient = ReturnType<typeof google.androidpublisher>;

let publisher: AndroidPublisherClient | null = null;

function normalizePrivateKey(value: string) {
  const hasEscapedNewlines = value.includes("\\\\n");
  const hasRealNewlines = value.includes("\n");
  return hasEscapedNewlines && !hasRealNewlines ? value.replace(/\\\\n/g, "\n") : value;
}

function readServiceAccount(): ServiceAccountConfig | null {
  const clientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PLAY_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (!clientEmail || !privateKey) {
    return null;
  }
  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
    projectId: projectId || undefined,
  };
}

function createAuth() {
  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    return new google.auth.GoogleAuth({ scopes: SCOPE });
  }
  return new google.auth.GoogleAuth({
    scopes: SCOPE,
    projectId: serviceAccount.projectId,
    credentials: {
      client_email: serviceAccount.clientEmail,
      private_key: serviceAccount.privateKey,
    },
  });
}

export function getAndroidPublisher(): AndroidPublisherClient {
  if (publisher) {
    return publisher;
  }
  const auth = createAuth();
  const androidpublisher = google.androidpublisher({ version: "v3", auth });
  publisher = androidpublisher;
  return androidpublisher;
}

export async function verifyProductPurchase({
  packageName,
  productId,
  token,
}: {
  packageName: string;
  productId: string;
  token: string;
}) {
  const androidpublisher = getAndroidPublisher();
  const res = await androidpublisher.purchases.products.get({ packageName, productId, token });
  return res.data as any;
}

export async function consumeProductPurchase({
  packageName,
  productId,
  token,
}: {
  packageName: string;
  productId: string;
  token: string;
}) {
  const androidpublisher = getAndroidPublisher();
  await androidpublisher.purchases.products.consume({ packageName, productId, token });
}
