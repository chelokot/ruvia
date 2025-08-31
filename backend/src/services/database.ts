import {
  type CollectionReference,
  getFirestore,
} from "firebase-admin/firestore";
import type { User } from "./user.js";

export type Database = {
  user: CollectionReference<User>;
};

export function initDatabaseClient(): Database {
  const client = getFirestore();

  return {
    user: client.collection("users") as CollectionReference<User>,
  };
}
