/**
 * Cafe Billing App - Modern Professional Design System
 * Primary: Midnight Indigo (#6366F1) - Modern, Tech-focused, Professional
 * Accent: Amber Glow (#F59E0B) - Interactive, Warm
 */

import { Platform } from "react-native";

// Brand Colors (Solid Modern Palette)
export const BrandColors = {
  primary: "#6366F1", // Midnight Indigo
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  accent: "#F59E0B", // Amber
  accentLight: "#FBBF24",
  accentDark: "#D97706",
  success: "#10B981", // Emerald
  danger: "#EF4444", // Rose
  warning: "#F59E0B",
  info: "#3B82F6",
  white: "#FFFFFF",
  black: "#0F172A", // Deep Slate
  gray: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
};

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#64748B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    tint: BrandColors.primary,
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: BrandColors.primary,
    border: "#E2E8F0",
    card: "#FFFFFF",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    background: "#0F172A",
    surface: "#1E293B",
    tint: BrandColors.primaryLight,
    icon: "#94A3B8",
    tabIconDefault: "#475569",
    tabIconSelected: BrandColors.primaryLight,
    border: "#334155",
    card: "#1E293B",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "Menlo",
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    serif: "Georgia, serif",
    rounded: "Inter, system-ui, sans-serif",
    mono: "monospace",
  },
});

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};
