/**
 * Cafe Billing App Theme Colors
 * Primary: Blue (#1E5F8A) - Professional, trustworthy
 * Accent: Orange (#E89923) - Warm, inviting
 */

import { Platform } from "react-native";

// Brand Colors
export const BrandColors = {
  primary: "#EC2B25",
  primaryLight: "#2A7AB5",
  primaryDark: "#154563",
  accent: "#E89923",
  accentLight: "#F5A83D",
  accentDark: "#C77E1A",
  success: "#28A745",
  danger: "#DC3545",
  warning: "#FFC107",
  info: "#17A2B8",
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F8F9FA",
    100: "#F1F3F5",
    200: "#E9ECEF",
    300: "#DEE2E6",
    400: "#CED4DA",
    500: "#ADB5BD",
    600: "#6C757D",
    700: "#495057",
    800: "#343A40",
    900: "#212529",
  },
};

export const Colors = {
  light: {
    text: "#212529",
    textSecondary: "#6C757D",
    background: "#F8F9FA",
    surface: "#FFFFFF",
    tint: BrandColors.primary,
    icon: "#6C757D",
    tabIconDefault: "#ADB5BD",
    tabIconSelected: BrandColors.primary,
    border: "#DEE2E6",
    card: "#FFFFFF",
  },
  dark: {
    text: "#F8F9FA",
    textSecondary: "#ADB5BD",
    background: "#121212",
    surface: "#1E1E1E",
    tint: BrandColors.accentLight,
    icon: "#ADB5BD",
    tabIconDefault: "#6C757D",
    tabIconSelected: BrandColors.accent,
    border: "#343A40",
    card: "#1E1E1E",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};
