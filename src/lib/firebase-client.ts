import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env, hasFirebaseBrowserEnv } from "./env";

let app: FirebaseApp | null = null;

export function getFirebaseClientApp() {
  if (!hasFirebaseBrowserEnv()) {
    return null;
  }

  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: env.firebaseApiKey,
          authDomain: env.firebaseAuthDomain,
          projectId: env.firebaseProjectId,
          storageBucket: env.firebaseStorageBucket,
          messagingSenderId: env.firebaseMessagingSenderId,
          appId: env.firebaseAppId,
        });
  }

  return app;
}

export function getFirebaseAuth() {
  const clientApp = getFirebaseClientApp();
  return clientApp ? getAuth(clientApp) : null;
}

export function getFirebaseClientDb() {
  const clientApp = getFirebaseClientApp();
  return clientApp ? getFirestore(clientApp) : null;
}
