import { purchaseItemAsync } from '@/lib/iap';
import * as RNIap from 'react-native-iap';

jest.mock('react-native-iap', () => ({ requestPurchase: jest.fn().mockResolvedValue(undefined) }));

describe('purchaseItemAsync', () => {
  it('requests purchase with android request payload', async () => {
    await purchaseItemAsync('test.sku');
    expect(RNIap.requestPurchase).toHaveBeenCalledWith({
      request: { android: { skus: ['test.sku'] } },
      type: 'inapp',
    });
  });
});
