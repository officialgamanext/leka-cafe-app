import { BorderRadius, BrandColors, Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

const SkeletonPulse = () => {
  React.useEffect(() => {
    const animation = require("react-native").Animated;
    const pulse = new animation.Value(0.3);

    animation.loop(
      animation.sequence([
        animation.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        animation.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => pulse.setValue(0.3);
  }, []);

  return null;
};

export const SkeletonBusinessCard = () => {
  return (
    <View style={styles.businessCard}>
      <View style={styles.businessIcon} />
      <View style={styles.businessInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineSmall]} />
      </View>
    </View>
  );
};

export const SkeletonBusinessList = () => {
  return (
    <View style={styles.listContent}>
      {[...Array(3)].map((_, index) => (
        <SkeletonBusinessCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: Spacing.lg,
  },
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  businessIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[200],
    marginRight: Spacing.md,
  },
  businessInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: BrandColors.gray[200],
    borderRadius: BorderRadius.md,
    width: "100%",
  },
  skeletonLineShort: {
    width: "80%",
  },
  skeletonLineSmall: {
    width: "50%",
    height: 12,
  },
});
