import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ErrorParams = {
  buttonLabel?: string;
};

export default function ErrorScreen() {
  const { buttonLabel } = useLocalSearchParams<ErrorParams>();

  const actionText = buttonLabel === "Retry" ? "Retry" : "Try Again";

  const handleAction = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="warning-outline"
            size={48}
            color={BrandColors.danger}
          />
        </View>

        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          We are unable to process your request right now. Please try again.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 180,
    alignItems: "center",
  },
  buttonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
});
