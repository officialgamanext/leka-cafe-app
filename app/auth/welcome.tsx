import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React from "react";
import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Redirect href="/auth/business-list" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Leka Cafe</Text>
        <Text style={styles.tagline}>Smart Billing for Smart Cafes</Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color={BrandColors.accent}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Quick Billing</Text>
            <Text style={styles.featureDesc}>Create bills in seconds</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons
              name="analytics-outline"
              size={28}
              color={BrandColors.accent}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Track Sales</Text>
            <Text style={styles.featureDesc}>Monitor your business growth</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons
              name="print-outline"
              size={28}
              color={BrandColors.accent}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Easy Print</Text>
            <Text style={styles.featureDesc}>Print receipts instantly</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={BrandColors.white} />
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: BrandColors.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSizes.lg,
    color: BrandColors.gray[600],
  },
  featuresContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  ctaContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  termsText: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    lineHeight: 18,
  },
});
