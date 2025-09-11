import { useCredits } from '../src/services/user';

function makeDb(initialCredits: number) {
  let credits = initialCredits;
  const firestore = {
    runTransaction: async (fn: any) => fn({
      get: async (_ref: any) => ({ exists: true, data: () => ({ credits }) }),
      update: (_ref: any, update: any) => { credits = update.credits; },
    }),
  };
  const docRef = { id: 'u' };
  return {
    user: {
      firestore,
      doc: (_id: string) => docRef,
    },
    get credits() { return credits; },
  } as any;
}

describe('useCredits', () => {
  it('returns false for non-positive amount', async () => {
    const db = makeDb(5);
    expect(await useCredits({ db: db as any, firebaseId: 'u', amount: 0 })).toBe(false);
    expect(await useCredits({ db: db as any, firebaseId: 'u', amount: -1 })).toBe(false);
  });

  it('fails when not enough credits', async () => {
    const db = makeDb(1);
    const ok = await useCredits({ db: db as any, firebaseId: 'u', amount: 2 });
    expect(ok).toBe(false);
    expect(db.credits).toBe(1);
  });

  it('deducts credits when sufficient', async () => {
    const db = makeDb(3);
    const ok = await useCredits({ db: db as any, firebaseId: 'u', amount: 2 });
    expect(ok).toBe(true);
    expect(db.credits).toBe(1);
  });
});
