// ── RevenueCat paywall service ────────────────────────────────────────────────
// Set MVP_FREE_MODE = true during testing — everything is unlocked, no real
// purchases happen. Flip to false before launch to activate real RevenueCat.
import { Platform } from 'react-native';

export const MVP_FREE_MODE = false;

// RevenueCat issues separate keys per store; fall back to the shared var so
// this keeps working before env vars are migrated.
// Note: these must stay as literal process.env.X references — Expo inlines them
// at build time and a dynamic process.env[name] lookup would not be replaced.
const PLATFORM_KEY = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
  : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
const FALLBACK_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

const API_KEY = PLATFORM_KEY || FALLBACK_KEY || '';

const API_KEY_SOURCE = PLATFORM_KEY
  ? (Platform.OS === 'ios'
      ? 'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS'
      : 'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID')
  : FALLBACK_KEY
    ? 'EXPO_PUBLIC_REVENUECAT_API_KEY (fallback)'
    : 'none';

// Masked identifier for the key compiled into this build: first 8 + last 6
// characters, its length, and which env var it came from. Lets a built app be
// compared against the key shown in the RevenueCat dashboard without printing
// the whole value.
export function getApiKeyFingerprint() {
  if (!API_KEY) return `EMPTY (src=${API_KEY_SOURCE})`;
  const masked = API_KEY.length > 14
    ? `${API_KEY.slice(0, 8)}...${API_KEY.slice(-6)}`
    : '(too short to mask)';
  return `${masked} len=${API_KEY.length} src=${API_KEY_SOURCE}`;
}

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
    console.log('[RevenueCat] configuring on', Platform.OS, 'with key', getApiKeyFingerprint());
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

// Triggers the purchase flow. Returns true on success, false if the user
// cancelled. Throws for any other failure (no SDK, no package available,
// or a purchase error) so the caller can surface a diagnostic message
// instead of the failure disappearing silently.
export async function purchaseSubscription() {
  if (MVP_FREE_MODE) return true;
  const sdk = await getSDK();
  if (!sdk) throw new Error('RevenueCat SDK failed to load');
  const offerings = await sdk.getOfferings();
  const pkg = offerings.current?.monthly ?? offerings.current?.availablePackages?.[0];
  if (!pkg) {
    console.warn('[RevenueCat] No package found');
    throw new Error('No subscription package available from RevenueCat (offerings empty)');
  }
  try {
    await sdk.purchasePackage(pkg);
    return true;
  } catch (e) {
    if (e?.userCancelled) return false;
    console.warn('[RevenueCat] purchaseSubscription error:', e);
    throw e;
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
