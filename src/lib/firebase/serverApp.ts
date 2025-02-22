import "server-only";

import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

const formatPrivateKey = (key: string | undefined) => {
  return key?.replace(/\\n/g, "\n");
};

export function createFirebaseAdminApp() {
  const params = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  };

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey: params.privateKey
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
    storageBucket: params.storageBucket
  });
}

getApps().length === 0 ? createFirebaseAdminApp() : getApps()[0];
export const db = admin.firestore();
export const storage = admin.storage();
