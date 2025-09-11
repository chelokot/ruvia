import { purchaseItemAsync } from '@/lib/iap';
import * as RNIap from 'react-native-iap';

jest.mock('react-native-iap', () => ({ requestPurchase: jest.fn().mockResolvedValue(undefined) }));

describe('purchaseItemAsync', () => {
  it('requests purchase with skus array', async () => {
    await purchaseItemAsync('test.sku');
    expect(RNIap.requestPurchase).toHaveBeenCalledWith({ skus: ['test.sku'] });
  });
});
