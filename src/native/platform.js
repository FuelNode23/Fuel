// Thin wrapper around Capacitor so the rest of the app can ask "am I
// running inside the iOS/Android app?" without importing Capacitor
// everywhere. On the website every helper here is a no-op / falls back to
// plain browser behaviour, so web builds behave exactly as before.
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

/** True inside the native iOS/Android shell, false on app.fuelnode.fr. */
export const isNativeApp = () => Capacitor.isNativePlatform();

/** Custom URL scheme registered in AndroidManifest.xml / Info.plist. */
export const APP_URL_SCHEME = "fuelnode";

/**
 * Opens an external page (Stripe Checkout, etc.). In the app this uses the
 * system in-app browser (SFSafariViewController / Chrome Custom Tab) so the
 * app's own WebView - and the user's session in it - is never navigated
 * away. On the web it's a normal same-tab redirect, as before.
 */
export async function openExternal(url) {
  if (isNativeApp()) {
    await Browser.open({ url, presentationStyle: "fullscreen" });
  } else {
    window.location.href = url;
  }
}

export async function closeExternal() {
  if (!isNativeApp()) return;
  try {
    await Browser.close();
  } catch {
    // Android has nothing to close once the deep link brought the app back.
  }
}

/**
 * Turns a deep link like fuelnode://order-confirmed?plan=elite into the
 * in-app route "/order-confirmed?plan=elite". Returns null for anything
 * that isn't ours.
 */
export function routeFromAppUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== `${APP_URL_SCHEME}:`) return null;
    // fuelnode://order-confirmed?x  -> host "order-confirmed", pathname ""
    // fuelnode:///order-confirmed?x -> host "",                pathname "/order-confirmed"
    const path = `${url.host}${url.pathname}`.replace(/^\/+/, "");
    return `/${path}${url.search}`;
  } catch {
    return null;
  }
}
