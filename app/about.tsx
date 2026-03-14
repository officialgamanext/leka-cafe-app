import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="cafe" size={80} color={BrandColors.primary} />
          <Text style={styles.appName}>CafeBill</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Our mission is to simplify the operations of cafes, restaurants, and
            food businesses. We strive to provide accessible and powerful
            billing solutions so business owners can focus more on their passion
            for food and serving their customers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <Text style={styles.sectionText}>
            CafeBill helps you create bills easily, manage table orders,
            configure printers for swift printing, and monitor your business
            sales. Our fast and intuitive mobile-first application is perfectly
            tuned to real-time restaurant needs.
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Made with ❤️ for Cafes</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://cafebill.com")}
          >
            <Text style={styles.linkText}>Visit our website</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: BrandColors.gray[900],
    marginTop: Spacing.md,
  },
  version: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    marginTop: 4,
  },
  section: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[700],
    lineHeight: 24,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  linkText: {
    fontSize: FontSizes.md,
    color: BrandColors.primary,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
});
