import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useApiDashboard, useApiDashboardWeeklyProgress } from "@/hooks/use-api-dashboard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { currentBusiness } = useAuth();
  const { data, isLoading, refetch } = useApiDashboard({ tenantId: currentBusiness?.id || "" });
  const { data: weeklyData, refetch: refetchWeekly } = useApiDashboardWeeklyProgress({ tenantId: currentBusiness?.id || "" });

  const subInfo = {
    label: "Professional Plan",
    icon: "shield-checkmark",
    color: BrandColors.success,
  };

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WEEKDAY_COLORS = [
    BrandColors.primary,
    BrandColors.primaryLight,
    BrandColors.primary,
    BrandColors.primaryLight,
    BrandColors.accent,
    BrandColors.accent,
    BrandColors.accent,
  ];

  const customBarData = (weeklyData?.dailyBreakdown ?? []).map((item) => ({
    label: DAY_LABELS[new Date(item.date).getDay()],
    value: item.salesAmount,
    color: WEEKDAY_COLORS[new Date(item.date).getDay()],
  }));

  const maxBarValue = Math.max(...customBarData.map((b) => b.value), 1);

  const weeklyTrend = weeklyData?.trend ?? "neutral";
  const weeklyPct = weeklyData?.percentageChange ?? 0;
  const trendIcon = weeklyTrend === "up" ? "trending-up" : weeklyTrend === "down" ? "trending-down" : "remove-outline";
  const trendColor = weeklyTrend === "up" ? BrandColors.success : weeklyTrend === "down" ? BrandColors.danger : BrandColors.gray[400];

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>Fetching your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BrandColors.primary} />
      <View style={{ height: insets.top, backgroundColor: BrandColors.primary }} />

      {/* High-End Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <View>
            <Text style={styles.greetingText}>Good Day,</Text>
            <Text style={styles.businessNameText}>{currentBusiness?.name || "Your Cafe"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notifBadge}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="notifications-outline" size={24} color={BrandColors.white} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <View style={styles.subPill}>
          <View style={[styles.subDot, { backgroundColor: subInfo.color }]} />
          <Text style={styles.subText}>Premium Subscription: Active</Text>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.renewText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => { refetch(); refetchWeekly(); }} tintColor={BrandColors.primary} />}
      >
        {/* Modern Statistics Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, styles.statsCardPrimary]}>
             <View style={styles.statsIconBox}>
                <Ionicons name="wallet-outline" size={20} color={BrandColors.white} />
             </View>
             <Text style={styles.statsValueMain}>₹{data.totalSalesAmount?.toLocaleString() || "0"}</Text>
             <Text style={styles.statsLabelMain}>Net Revenue Today</Text>
          </View>
          <View style={styles.statsCard}>
             <View style={[styles.statsIconBox, { backgroundColor: BrandColors.primary + "10" }]}>
                <Ionicons name="receipt-outline" size={20} color={BrandColors.primary} />
             </View>
             <Text style={styles.statsValueSub}>{data.todaysOrdersCount || "0"}</Text>
             <Text style={styles.statsLabelSub}>Successful Orders</Text>
          </View>
        </View>

        {/* Professional Business Tools Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Business Arsenal</Text>
              <Text style={styles.sectionSubtitle}>Core tools for your daily operations</Text>
            </View>
          </View>
          
          <View style={styles.toolsGrid}>
            {[
              {
                label: "Billing",
                icon: "add-circle",
                path: "/billing",
                color: BrandColors.primary,
              },
              {
                label: "History",
                icon: "receipt",
                path: "/bills",
                color: BrandColors.accent,
              },
              {
                label: "Catalog",
                icon: "cafe",
                path: "/items",
                color: BrandColors.success,
              },
              {
                label: "Insights",
                icon: "analytics",
                path: "/reports",
                color: BrandColors.info,
              },
            ].map((tool, i) => (
              <TouchableOpacity
                key={i}
                style={styles.toolCard}
                onPress={() => router.push(tool.path as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.toolIconFrame, { backgroundColor: tool.color + "08" }]}>
                  <Ionicons name={tool.icon as any} size={26} color={tool.color} />
                </View>
                <Text style={styles.toolLabelText}>{tool.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visual Analytics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Performance</Text>
            <View style={[styles.performanceBadge, { backgroundColor: trendColor + "10" }]}>
                <Ionicons name={trendIcon as any} size={12} color={trendColor} />
                <Text style={[styles.performanceBadgeText, { color: trendColor }]}>
                  {weeklyTrend === "down" ? "-" : weeklyTrend === "up" ? "+" : ""}{weeklyPct}%
                </Text>
            </View>
          </View>
          <View style={styles.analyticsSheet}>
             <View style={styles.barGraph}>
                {customBarData.map((bar, i) => (
                  <View key={i} style={styles.graphColumn}>
                    <View style={styles.graphTrack}>
                      <View style={[styles.graphFill, { height: `${(bar.value/maxBarValue)*100}%`, backgroundColor: bar.color }]} />
                    </View>
                    <Text style={styles.graphLabel}>{bar.label}</Text>
                  </View>
                ))}
             </View>
          </View>
        </View>

        {/* Live Transaction Stream */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Stream</Text>
              <TouchableOpacity onPress={() => router.push("/bills")}>
                <Text style={styles.actionText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {!data.todaysOrderData || data.todaysOrderData.length === 0 ? (
               <View style={styles.emptyState}>
                  <Ionicons name="hourglass-outline" size={32} color={BrandColors.gray[200]} />
                  <Text style={styles.emptyStateText}>Waiting for first order of the day...</Text>
               </View>
            ) : (
              data.todaysOrderData.slice(0, 3).map((order: any) => (
                <View key={order.id} style={styles.logItem}>
                  <View style={styles.logIconWrapper}>
                    <Ionicons name="checkmark-circle" size={18} color={BrandColors.success} />
                  </View>
                  <View style={styles.logBody}>
                     <Text style={styles.logTitle}>Bill #{(order.friendlyId || "000").slice(-6)}</Text>
                     <Text style={styles.logMeta}>{order.createdAt}</Text>
                  </View>
                  <View style={styles.logPriceBox}>
                    <Text style={styles.logPrice}>₹{order.totalAmount}</Text>
                  </View>
                </View>
              ))
            )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BrandColors.white,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: BrandColors.gray[400],
    fontWeight: "600",
  },
  banner: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    ...Shadows.md,
  },
  bannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  greetingText: {
    fontSize: FontSizes.sm,
    color: BrandColors.white,
    opacity: 0.8,
    fontWeight: "600",
  },
  businessNameText: {
    fontSize: FontSizes.xxl,
    color: BrandColors.white,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  notifBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white + "15",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.white + "10",
  },
  dot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.accent,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  subPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    backgroundColor: BrandColors.white + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  subText: {
    fontSize: 10,
    color: BrandColors.white,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  renewText: {
    fontSize: 10,
    color: BrandColors.white,
    fontWeight: "900",
    marginLeft: 12,
    textDecorationLine: "underline",
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: -Spacing.xl,
  },
  statsCard: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
  },
  statsCardPrimary: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  statsIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statsValueMain: {
    fontSize: FontSizes.xxl,
    fontWeight: "900",
    color: BrandColors.white,
    letterSpacing: -0.5,
  },
  statsLabelMain: {
    fontSize: 10,
    color: BrandColors.white,
    opacity: 0.8,
    marginTop: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statsValueSub: {
    fontSize: FontSizes.xl,
    fontWeight: "900",
    color: BrandColors.gray[900],
  },
  statsLabelSub: {
    fontSize: 10,
    color: BrandColors.gray[400],
    marginTop: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[400],
    fontWeight: "500",
  },
  actionText: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: BrandColors.primary,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  toolCard: {
    width: "47.5%",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  toolIconFrame: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  toolLabelText: {
    fontSize: 13,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  performanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.success + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  performanceBadgeText: {
    fontSize: 10,
    color: BrandColors.success,
    fontWeight: "800",
  },
  analyticsSheet: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  barGraph: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  graphColumn: {
    alignItems: "center",
    width: 30,
  },
  graphTrack: {
    width: 8,
    height: 100,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.full,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  graphFill: {
    width: "100%",
    borderRadius: BorderRadius.full,
  },
  graphLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: BrandColors.gray[400],
    marginTop: 8,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  logIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.success + "08",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  logBody: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.gray[800],
  },
  logMeta: {
    fontSize: 11,
    color: BrandColors.gray[400],
    fontWeight: "500",
  },
  logPriceBox: {
    alignItems: "flex-end",
  },
  logPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: "center",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    borderStyle: "dashed",
  },
  emptyStateText: {
    color: BrandColors.gray[300],
    fontSize: 12,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
});
