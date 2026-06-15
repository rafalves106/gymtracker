export interface NotificationOptions {
  title: string;
  body: string;
  tag?: string;
  badge?: string;
  icon?: string;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Notificações não suportadas neste navegador");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function sendNotification(options: NotificationOptions): void {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(options.title, {
      body: options.body,
      tag: options.tag || "gymtracker",
      badge: options.badge,
      icon: options.icon || "/favicon.svg",
    });
  }
}

export function isPageVisible(): boolean {
  return !document.hidden;
}

export function onPageVisibilityChange(
  callback: (visible: boolean) => void,
): () => void {
  const handler = () => {
    callback(!document.hidden);
  };

  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}

export function triggerDeviceVibration(pattern: number | number[]): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
