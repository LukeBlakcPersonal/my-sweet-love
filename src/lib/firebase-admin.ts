import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env, hasFirebaseServerEnv } from "./env";

export function getFirebaseAdminApp() {
  if (!hasFirebaseServerEnv()) {
    return null;
  }

  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  const privateKey = env.firebasePrivateKey?.replace(/\\n/g, "\n");

  try {
    return initializeApp({
      credential: cert({
        projectId: env.firebaseProjectIdAdmin,
        clientEmail: env.firebaseClientEmail,
        privateKey,
      } as ServiceAccount),
    });
  } catch {
    // Another request or hot-reload cycle may initialize first.
    return getApps()[0] ?? null;
  }
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}
