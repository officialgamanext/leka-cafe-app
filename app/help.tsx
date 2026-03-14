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

export default function HelpAndSupportScreen() {
  const handleEmail = () => {
    Linking.openURL("mailto:support@cafebill.com");
  };

  const handleCall = () => {
    Linking.openURL("tel:+919876543210");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={48} color={BrandColors.primary} />
          </View>
          <Text style={styles.title}>How can we help you?</Text>
          <Text style={styles.subtitle}>
            Our support team is available from 9 AM to 6 PM (Monday to Saturday)
            to assist you with any queries.
          </Text>

          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.option} onPress={handleCall}>
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: BrandColors.success + "15" },
                ]}
              >
                <Ionicons name="call" size={24} color={BrandColors.success} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Call Us</Text>
                <Text style={styles.optionDesc}>+91 98765 43210</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleEmail}>
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: BrandColors.primary + "15" },
                ]}
              >
                <Ionicons name="mail" size={24} color={BrandColors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Email Us</Text>
                <Text style={styles.optionDesc}>support@cafebill.com</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Working Hours</Text>
          <View style={styles.row}>
            <Text style={styles.day}>Monday - Saturday</Text>
            <Text style={styles.time}>9:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.day}>Sunday</Text>
            <Text style={styles.timeClosed}>Closed</Text>
          </View>
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
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  contactOptions: {
    width: "100%",
    gap: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.gray[200],
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  optionDesc: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  day: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[800],
  },
  time: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.success,
  },
  timeClosed: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.danger,
  },
});
