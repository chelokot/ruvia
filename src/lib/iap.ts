import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { captureMonitoringError, createCorrelationId, logPurchaseStage } from '@/lib/monitoring';

export type Product = RNIap.Product;

export async function connectAsync() {
  if (Platform.OS !== 'android') return;
  await RNIap.initConnection();
}

export async function getProductsAsync(productIds: string[]) {
  const results = await RNIap.fetchProducts({ skus: productIds, type: 'inapp' });
  return results;
}

export type PurchaseListener = (purchase: RNIap.Purchase) => Promise<void> | void;

let purchaseSub: RNIap.PurchaseUpdatedListener | null = null;
let errorSub: RNIap.PurchaseErrorListener | null = null;

export function setPurchaseListener(listener: PurchaseListener) {
  purchaseSub?.remove();
  errorSub?.remove();
  purchaseSub = RNIap.purchaseUpdatedListener(async (purchase) => {
    try {
      await listener(purchase);
    } catch (e) {
      // no-op; let caller handle errors
    }
  });
  errorSub = RNIap.purchaseErrorListener((error) => {
    const correlationId = createCorrelationId();
    logPurchaseStage({ stage: 'iap_error', correlationId, status: String(error?.code ?? 'unknown'), error: (error as any)?.message ?? 'unknown' });
    captureMonitoringError(error, { source: 'iapPurchaseError', code: (error as any)?.code }, correlationId);
  });
  return { remove() { purchaseSub?.remove(); errorSub?.remove(); purchaseSub = null; errorSub = null; } };
}

export async function finishTransactionAsync(purchase: RNIap.Purchase) {
  try {
    await RNIap.finishTransaction({ purchase, isConsumable: true });
  } catch {}
}

export async function purchaseItemAsync(sku: string) {
  await RNIap.requestPurchase({ request: { android: { skus: [sku] } }, type: 'inapp' });
}
