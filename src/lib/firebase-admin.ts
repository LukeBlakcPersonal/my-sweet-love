import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env, hasFirebaseServerEnv } from "./env";

let initialized = false;

export function getFirebaseAdminApp() {
  if (!hasFirebaseServerEnv()) {
    return null;
  }

  if (!initialized) {
    const privateKey = env.firebasePrivateKey?.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({
        projectId: env.firebaseProjectIdAdmin,
        clientEmail: env.firebaseClientEmail,
        privateKey,
      } as ServiceAccount),
    });

    initialized = true;
  }

  return getApps()[0] ?? null;
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}
