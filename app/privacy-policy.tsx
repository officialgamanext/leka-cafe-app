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

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.sectionText}>
            We collect personal information such as your name, mobile number,
            and business details when you register with CafeBill. This helps us
            ensure your bills and GST information remain compliant and
            functional.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Information</Text>
          <Text style={styles.sectionText}>
            The information we collect is used solely to provide and improve our
            services, communicate system updates to you, and offer helpful
            support when needed. We do not sell your personal data to any third
            parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Security</Text>
          <Text style={styles.sectionText}>
            We put robust safety measures into place using standard digital
            security protocols to ensure that your business and customer details
            are safely stored against unauthorized access.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Contact for Privacy</Text>
          <Text style={styles.sectionText}>
            If you have questions regarding these policies, please reach out to
            us from our Help & Support section. We are happy to clarify any
            concerns.
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
