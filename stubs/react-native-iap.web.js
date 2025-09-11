// Web stub for react-native-iap used by browser field mapping.
// Provides minimal no-op implementations to keep web bundle safe.
export async function initConnection() { return true; }
export async function endConnection() { return true; }
export async function getProducts() { return []; }
export function purchaseUpdatedListener() { return { remove() {} }; }
export function purchaseErrorListener() { return { remove() {} }; }
export async function finishTransaction() { return true; }
export async function requestPurchase() { return; }

