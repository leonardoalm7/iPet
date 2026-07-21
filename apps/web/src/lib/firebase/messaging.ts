import { getFirebaseApp, isFirebaseConfigured } from "./client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type StatusPush =
  | "nao-suportado"
  | "nao-configurado"
  | "negado"
  | "ativo"
  | "inativo";

export async function statusAtual(): Promise<StatusPush> {
  if (typeof window === "undefined") return "inativo";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return "nao-suportado";
  }
  if (!isFirebaseConfigured()) return "nao-configurado";
  if (Notification.permission === "denied") return "negado";
  if (Notification.permission === "granted") return "ativo";
  return "inativo";
}

async function registrarServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
}

export async function pedirPermissaoEObterToken(): Promise<{
  token: string;
  userAgent: string;
} | null> {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured() || !VAPID_KEY) {
    console.warn("[push] Firebase não configurado");
    return null;
  }
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return null;

  const app = getFirebaseApp();
  if (!app) return null;

  const swReg = await registrarServiceWorker();
  const { getMessaging, getToken } = await import("firebase/messaging");
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (!token) return null;
  return { token, userAgent: navigator.userAgent };
}

export async function escutarMensagensForeground(
  handler: (titulo: string, corpo: string) => void,
): Promise<() => void> {
  const app = getFirebaseApp();
  if (!app) return () => {};
  const { getMessaging, onMessage } = await import("firebase/messaging");
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    const titulo = payload.notification?.title ?? "iPet";
    const corpo = payload.notification?.body ?? "";
    handler(titulo, corpo);
  });
}
