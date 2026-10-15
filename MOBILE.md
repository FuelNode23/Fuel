# FuelNode mobile app (Android + iOS)

The mobile app is this same React/Vite frontend packaged with **Capacitor 7**.
One codebase: every change to `src/` ships to the website *and* the apps.

- App ID: `fr.fuelnode.app` · App name: `FuelNode`
- Native projects: `android/` (open in Android Studio), `ios/` (open in Xcode)
- The app bundles the built `dist/` and talks to `https://app.fuelnode.fr/api`

## One-time setup

| Platform | You need |
|---|---|
| Android | Android Studio (Ladybug 2024.2.1 or newer), JDK 21 (bundled with Android Studio) |
| iOS | A Mac with Xcode 16+, CocoaPods not required (Swift Package Manager is used), Apple Developer account ($99/yr) |

```bash
npm install
```

## Everyday workflow

```bash
npm run build        # build the web app into dist/
npx cap sync         # copy dist/ + plugins into android/ and ios/
npx cap open android # opens Android Studio -> Run ▶ on an emulator or phone
npx cap open ios     # (Mac only) opens Xcode -> Run ▶
```

Run `npm run build && npx cap sync` every time you change frontend code before running the app again.

Shortcut for a quick check on a USB-connected Android phone: `npx cap run android`.

## Backend changes required (FuelNode-Backend)

1. **CORS**: The app's WebView calls the API from its own origin, so the backend has to allow it. Add the two app origins to the `CORS_ALLOWED_ORIGINS` env var on the EC2 server (keep the existing website origin):
   ```
   CORS_ALLOWED_ORIGINS=https://app.fuelnode.fr,https://localhost,capacitor://localhost
   ```
   `https://localhost` is Android, `capacitor://localhost` is iOS. Restart the backend afterwards.
2. **Stripe return to the app**: `POST /api/subscription/checkout?client=app` is now supported (`SubscriptionController` / `StripeCheckoutService`). For app clients, Stripe's success and cancel URLs go to `https://app.fuelnode.fr/app-return/...`.
3. **Deploy the website too**: the `/app-return` page lives in this frontend, so push it to `develop` and let the normal deploy run. The app can't come back from Stripe until both the backend and the website are deployed.

## How payment works in the app

1. CheckoutSummary → `createCheckoutSession()` sends `client=app`.
2. Stripe Checkout opens in the system in-app browser (Chrome Custom Tab or SFSafariViewController), so the app's own login session is never lost.
3. After payment, Stripe redirects to `https://app.fuelnode.fr/app-return/order-confirmed?plan=…`.
4. That page (`src/pages/AppReturn.jsx`) opens `fuelnode://order-confirmed?plan=…`. If the browser blocks the automatic redirect, it shows an "Open FuelNode app" button.
5. `src/native/NativeBridge.jsx` catches the deep link, closes the browser and navigates to `/order-confirmed`.

FuelNode sells a **physical** box, so paying with Stripe is allowed by both stores. Apple's in-app purchase is only required for digital goods.

**Optional later improvement:** switch to Android App Links / iOS Universal Links. Host `assetlinks.json` and `apple-app-site-association` on app.fuelnode.fr, and the bounce page then disappears completely.

## What changed in the code

| File | Change |
|---|---|
| `capacitor.config.json` | App id/name, splash, status bar, safe-area handling |
| `src/native/platform.js` | `isNativeApp()`, `openExternal()`, and deep-link parsing |
| `src/native/NativeBridge.jsx` | Deep links, Android back button, status bar, `.native-app` CSS class |
| `src/pages/AppReturn.jsx` + route `/app-return/*` | Stripe → app hand-off page |
| `src/pages/CheckoutSummary.jsx`, `src/api/client.js` | Open Stripe in the in-app browser when running in the app |
| `index.html` | CSP `connect-src` now lists `https://app.fuelnode.fr` (in the app, `'self'` is localhost); `viewport-fit=cover` |
| `src/styles.css` | App-only tweaks under `.native-app` |
| `android/AndroidManifest.xml`, `ios/App/App/Info.plist` | Register the `fuelnode://` URL scheme |
| `assets/` | Source images for icons and splash. To regenerate: `npx capacitor-assets generate --iconBackgroundColor '#0a0e1a' --splashBackgroundColor '#0a0e1a'` |

The website behaves the same as before: all the native code is a no-op in a normal browser.

## Releasing

**Android (Google Play)**
1. In Android Studio, go to Build → Generate Signed App Bundle → create a keystore. **Back it up**: losing it means you can't publish updates.
2. Upload the `.aab` file to Play Console ($25 one-time fee). Start with an Internal testing track.
3. Bump `versionCode` and `versionName` in `android/app/build.gradle` for every release.

**iOS (App Store)**
1. In Xcode, open App → Signing & Capabilities and select your Team.
2. Product → Archive → Distribute → App Store Connect. Test via TestFlight first.

### Store blockers to fix before submitting
- **In-app account deletion**: both Apple (guideline 5.1.1(v)) and Google Play require it for apps where users can create an account. The app currently has no "Delete my account" option, and the backend has no endpoint for it.
- **Privacy policy URL**: both stores require one. The footer links to `/privacy`, but no such route exists yet, so it redirects to the landing page.
- **Apple guideline 4.2 (minimum functionality)**: Apple may push back on apps that feel like a repackaged website. Native touches help: push notifications for box delivery and protocol updates, and offline viewing of the protocol.
