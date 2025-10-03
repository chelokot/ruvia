const mockGoogleAuth = jest.fn(() => ({}));
const mockAndroidpublisher = jest.fn(() => ({ purchases: {} }));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: mockGoogleAuth,
    },
    androidpublisher: mockAndroidpublisher,
  },
}));

describe('getAndroidPublisher', () => {
  async function loadModule() {
    return await import('../src/services/play');
  }

  function resetEnv() {
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.GOOGLE_PLAY_CLIENT_EMAIL;
    delete process.env.GOOGLE_PLAY_PRIVATE_KEY;
    delete process.env.GOOGLE_PLAY_PROJECT_ID;
  }

  beforeEach(() => {
    resetEnv();
    mockGoogleAuth.mockClear();
    mockAndroidpublisher.mockClear();
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('creates auth with firebase credentials when provided', async () => {
    process.env.FIREBASE_CLIENT_EMAIL = 'svc@example.com';
    process.env.FIREBASE_PRIVATE_KEY = 'super-secret';
    process.env.FIREBASE_PROJECT_ID = 'project-123';
    const { getAndroidPublisher } = await loadModule();
    getAndroidPublisher();
    expect(mockGoogleAuth).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'project-123',
      credentials: {
        client_email: 'svc@example.com',
        private_key: 'super-secret',
      },
    }));
  });

  it('normalizes escaped newlines in private key', async () => {
    process.env.FIREBASE_CLIENT_EMAIL = 'svc@example.com';
    process.env.FIREBASE_PRIVATE_KEY = 'line1\\\\nline2';
    const { getAndroidPublisher } = await loadModule();
    getAndroidPublisher();
    expect(mockGoogleAuth).toHaveBeenCalledWith(expect.objectContaining({
      credentials: expect.objectContaining({
        private_key: 'line1\nline2',
      }),
    }));
  });

  it('falls back to default credentials when none provided', async () => {
    const { getAndroidPublisher } = await loadModule();
    getAndroidPublisher();
    expect(mockGoogleAuth).toHaveBeenCalledWith({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
  });
});
