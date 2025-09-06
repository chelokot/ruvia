import { getApiBase } from '@/lib/runtime';

describe('getApiBase', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...OLD_ENV }; });
  afterAll(() => { process.env = OLD_ENV; });

  // Focus on hostname mapping which is stable in tests

  it('maps ruvia.art domains', () => {
    (global as any).window = { location: { host: 'www.ruvia.art' } } as any;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(getApiBase()).toBe('https://api.ruvia.art');
  });
});
