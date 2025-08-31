// Minimal no-op shim for expo-in-app-purchases on platforms or builds
// where the native module is not installed. Exposes the small surface
// used in the app so Metro can bundle without the real package.

const IAPResponseCode = {
  OK: 0,
};

const IAPurchaseState = {
  PURCHASED: 1,
};

function notAvailable() {
  throw new Error('In-app purchases are not available in this build');
}

module.exports = {
  IAPResponseCode,
  IAPurchaseState,
  async connectAsync() { return null; },
  async getProductsAsync() { return { responseCode: IAPResponseCode.OK, results: [] }; },
  setPurchaseListener() { return { remove() {} }; },
  async finishTransactionAsync() { return null; },
  async purchaseItemAsync() { return notAvailable(); },
  default: this,
};

