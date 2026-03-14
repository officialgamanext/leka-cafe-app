import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { BrandColors } from "@/constants/theme";
import { AuthProvider } from "@/context/AuthContext";
import { BillingProvider } from "@/context/BillingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Retry failed queries up to 2 times,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff with a max delay of 30 seconds
    }
  }
});

// Custom light theme with our brand colors
const CafeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.primary,
    background: BrandColors.gray[50],
    card: BrandColors.white,
    text: BrandColors.gray[900],
    border: BrandColors.gray[200],
    notification: BrandColors.accent,
  },
};

const CafeDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.accent,
    background: "#121212",
    card: "#1E1E1E",
    text: BrandColors.gray[50],
    border: BrandColors.gray[800],
    notification: BrandColors.accent,
  },
};

export const unstable_settings = {
  initialRouteName: "auth",
};

import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BillingProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? CafeDarkTheme : CafeTheme}
          >
            <SafeAreaProvider>
              <SafeAreaView style={styles.container}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                  <Stack.Screen name="error" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </SafeAreaView>
            </SafeAreaProvider>
            <Toast />
          </ThemeProvider>
        </BillingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the view fills the entire safe area
    backgroundColor: "#fff",
  },
});
