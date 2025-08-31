import { FieldValue } from "firebase-admin/firestore";
import type { Database } from "./database.js";

export type User = {
  firebaseId: string;
  name: string;
  credits: number;
  generationCount: number;
};

type FindUserAndUpdateArgs = {
  db: Database;
  firebaseId: string;
  name: string;
};

export async function findUserAndUpdate({
  db,
  firebaseId,
  name,
}: FindUserAndUpdateArgs) {
  const user = await db.user.doc(firebaseId).get();
  if (!user.exists) {
    const newUser: User = { firebaseId, name, credits: 1, generationCount: 0 };
    await db.user.doc(firebaseId).set(newUser);
    return newUser;
  }
  await db.user.doc(firebaseId).update({ name });
  const current = user.data() as User;
  return { ...current, name } satisfies User;
}

type UseCreditsArgs = {
  db: Database;
  firebaseId: string;
  amount: number;
};

export async function useCredits({ db, firebaseId, amount }: UseCreditsArgs) {
  if (amount <= 0) {
    return false;
  }

  const documentReference = db.user.doc(firebaseId);
  const success = await db.user.firestore.runTransaction(
    async (transaction) => {
      const snapshot = await transaction.get(documentReference);
      if (!snapshot.exists) {
        return false;
      }
      const current = snapshot.data() as User;
      if (current.credits < amount) {
        return false;
      }
      transaction.update(documentReference, {
        credits: current.credits - amount,
      });
      return true;
    },
  );

  return success;
}

type IncrementGenerationCountArgs = {
  db: Database;
  firebaseId: string;
};

export async function incrementGenerationCount({
  db,
  firebaseId,
}: IncrementGenerationCountArgs): Promise<void> {
  const ref = db.user.doc(firebaseId);
  await ref.update({
    isNew: false,
    generationCount: FieldValue.increment(1),
  });
}
