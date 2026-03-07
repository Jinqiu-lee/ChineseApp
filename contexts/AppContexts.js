import { createContext, useContext } from "react";

// ── Drawer context ────────────────────────────────────────────────
export const DrawerCtx = createContext(null);
export const useDrawer = () => useContext(DrawerCtx);

// ── Onboarding context ────────────────────────────────────────────
export const OnboardingCtx = createContext(null);
export const useOnboarding = () => useContext(OnboardingCtx);