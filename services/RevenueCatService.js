// ── RevenueCat paywall service ────────────────────────────────────────────────
// Set MVP_FREE_MODE = true during testing — everything is unlocked, no real
// purchases happen. Flip to false before launch to activate real RevenueCat.
export const MVP_FREE_MODE = true;

const API_KEY = 'YOUR_REVENUECAT_API_KEY'; // Replace before launch

let Purchases = null;

async function getSDK() {
  if (MVP_FREE_MODE) return null;
  if (Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default ?? mod.Purchases ?? mod;
    return Purchases;
  } catch {
    return null;
  }
}

// Call once on app startup (in App.js) when MVP_FREE_MODE is false.
export async function initRevenueCat() {
  if (MVP_FREE_MODE) return;
  try {
    const sdk = await getSDK();
    if (!sdk) return;
    sdk.setLogLevel(sdk.LOG_LEVEL?.DEBUG ?? 4);
    await sdk.configure({ apiKey: API_KEY });
  } catch (e) {
    console.warn('[RevenueCat] init error:', e);
  }
}

// Returns true if user has an active subscription (or MVP_FREE_MODE is on).
export async function checkSubscriptionStatus() {
  if (MVP_FREE_MODE) return true;
  try {
    const sdk = await getSDK();
    if (!sdk) return false;
    const info = await sdk.getCustomerInfo();
    return Object.keys(info.entitlements.active).length > 0;
  } catch (e) {
    console.warn('[RevenueCat] checkSubscriptionStatus error:', e);
    return false;
  }
}

// Triggers the purchase flow. Returns true on success.
export async function purchaseSubscription() {
  if (MVP_FREE_MODE) return true;
  try {
    const sdk = await getSDK();
    if (!sdk) return false;
    const offerings = await sdk.getOfferings();
    const pkg = offerings.current?.monthly ?? offerings.current?.availablePackages?.[0];
    if (!pkg) { console.warn('[RevenueCat] No package found'); return false; }
    await sdk.purchasePackage(pkg);
    return true;
  } catch (e) {
    if (e?.userCancelled) return false;
    console.warn('[RevenueCat] purchaseSubscription error:', e);
    return false;
  }
}

// Restores prior purchases. Returns true if an active entitlement is found.
export async function restorePurchases() {
  if (MVP_FREE_MODE) return true;
  try {
    const sdk = await getSDK();
    if (!sdk) return false;
    const info = await sdk.restorePurchases();
    return Object.keys(info.entitlements.active).length > 0;
  } catch (e) {
    console.warn('[RevenueCat] restorePurchases error:', e);
    return false;
  }
}
