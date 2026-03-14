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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing or using the CafeBill application, you agree to be
            bound by these Terms. If you do not agree, please do not use our
            services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Account Registration</Text>
          <Text style={styles.sectionText}>
            To access certain features of our application, you may be asked to
            provide personal and business details. It is your responsibility to
            maintain the confidentially of your account's login information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Application Usage</Text>
          <Text style={styles.sectionText}>
            You agree not to use the application to process illegal
            transactions. All the items and transactions created strictly adhere
            to the local state laws and you bear all responsiblity for the data
            entries.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Disclaimer</Text>
          <Text style={styles.sectionText}>
            CafeBill operates "as is" and we are not liable for any losses
            accrued due to internet connectivity failures or hardware failures
            with devices and printers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modifications</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these terms at any time. We recommend
            reviewing these terms frequently. Your continued use of the
            application after changes means that you agree to the updated terms.
          </Text>
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
  lastUpdated: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    marginBottom: Spacing.lg,
    fontWeight: "500",
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
});
