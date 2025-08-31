import { google } from "googleapis";

const SCOPE = ["https://www.googleapis.com/auth/androidpublisher"];

let publisher: ReturnType<typeof import("googleapis").google.androidpublisher> | null = null;

export function getAndroidPublisher() {
  if (publisher) return publisher;
  const auth = new google.auth.GoogleAuth({ scopes: SCOPE });
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

