// Web stub for react-native-purchases to avoid bundling native SDK on web.
const Purchases = {
  setup: async () => {},
  getOfferings: async () => ({ current: null }),
  purchasePackage: async () => ({ purchaserInfo: {} }),
  addCustomerInfoUpdateListener: () => ({ remove() {} }),
};
export default Purchases;

