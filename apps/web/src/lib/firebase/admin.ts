import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let cached: App | null = null;

export function getAdminApp(): App | null {
  if (cached) return cached;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.warn("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON inválido (JSON)");
    return null;
  }

  if (getApps().length) {
    cached = getApps()[0];
    return cached;
  }
  cached = initializeApp({
    credential: cert(parsed as Parameters<typeof cert>[0]),
  });
  return cached;
}

export function getAdminMessaging(): Messaging | null {
  const app = getAdminApp();
  return app ? getMessaging(app) : null;
}
