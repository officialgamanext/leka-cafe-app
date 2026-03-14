import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useApiDashboard } from "@/hooks/use-api-dashboard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { currentBusiness, isAuthenticated } = useAuth();
  const { data: dashboardData, isLoading } = useApiDashboard({
    tenantId: currentBusiness?.id,
    enabled: !!currentBusiness?.id && isAuthenticated,
  });

  const defaultData = {
    totalSalesAmount: 15680,
    todaysOrdersCount: 42,
    averageOrderAmount: 373,
    topSellerItem: {
      productName: "Cappuccino",
    },
    todaysOrderData: [
      {
        id: "1",
        items: [{ name: "item" }],
        totalAmount: 520,
        createdAt: "2 min ago",
      },
      {
        id: "2",
        items: [{ name: "item" }],
        totalAmount: 340,
        createdAt: "15 min ago",
      },
    ],
  };

  const data = dashboardData || defaultData;

  const getSubscriptionStatusInfo = () => {
    const status: unknown = currentBusiness?.subscription?.status;
    const isSubscriptionActive =
      typeof status === "boolean"
        ? status
        : typeof status === "string"
          ? status.toLowerCase() === "true"
          : status instanceof Boolean
            ? status.valueOf()
            : false;

    if (!isSubscriptionActive) {
      return {
        label: "Inactive",
        color: BrandColors.danger,
      };
    }

    const endDateValue = currentBusiness?.subscription?.endDate;
    if (endDateValue) {
      const endDate = new Date(endDateValue);
      if (!Number.isNaN(endDate.getTime())) {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        if (endDate < oneMonthFromNow) {
          return {
            label: "Expiring Soon",
            color: BrandColors.warning,
          };
        }
      }
    }

    return {
      label: "Active",
      color: BrandColors.success,
    };
  };

  const subscriptionStatusInfo = getSubscriptionStatusInfo();

  // Simple Mock Custom Chart Bars data
  const customBarData = [
    { label: "Coffee", value: 65, color: BrandColors.primary },
    { label: "Tea", value: 40, color: BrandColors.accent },
    { label: "Snacks", value: 80, color: BrandColors.warning || "#F59E0B" },
    { label: "Meals", value: 30, color: BrandColors.danger },
  ];
  const maxBarValue = Math.max(...customBarData.map((d) => d.value));

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { padding: Spacing.lg }]}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonStatsContainer}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
        <View style={styles.skeletonChartPlaceholder} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={{ marginTop: 10, color: BrandColors.gray[500] }}>
            Loading Dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BrandColors.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.businessName}>
              {currentBusiness?.name || "CafeBill"}
            </Text>
            <Text style={styles.dateText}>Welcome back, Admin</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={BrandColors.white}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subscriptionRow}>
          <View style={styles.subscriptionMeta}>
            <Text style={styles.subscriptionText}>
              Subscription:{" "}
              <View
                style={[
                  styles.subscriptionStatusDot,
                  { backgroundColor: subscriptionStatusInfo.color },
                ]}
              />{" "}
              {subscriptionStatusInfo.label}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.renewButton}
            onPress={() => router.navigate("/subscriptions")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={BrandColors.primary}
            />
            <Text style={styles.renewButtonText}>Renew / Extend</Text>
          </TouchableOpacity>
        </View>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.navigate("/billing")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: BrandColors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color={BrandColors.primary}
                />
              </View>
              <Text style={styles.actionText}>New Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.navigate("/bills")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: BrandColors.accent + "15" },
                ]}
              >
                <Ionicons
                  name="list-outline"
                  size={28}
                  color={BrandColors.accent}
                />
              </View>
              <Text style={styles.actionText}>All Bills</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.navigate("/reports")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: BrandColors.success + "15" },
                ]}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={28}
                  color={BrandColors.success}
                />
              </View>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.navigate("/categories")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: BrandColors.info + "15" },
                ]}
              >
                <Ionicons
                  name="grid-outline"
                  size={28}
                  color={BrandColors.info}
                />
              </View>
              <Text style={styles.actionText}>Categories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview Snapshot</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statsCard, styles.primaryCard]}>
              <View style={styles.statsIconContainer}>
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={BrandColors.white}
                />
              </View>
              <Text style={styles.statsValue}>
                ₹{data.totalSalesAmount.toLocaleString()}
              </Text>
              <Text style={styles.statsLabel}>Today's Revenue</Text>
            </View>

            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, styles.accentIcon]}>
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={BrandColors.accent}
                />
              </View>
              <Text style={styles.statsValueDark}>
                {data.todaysOrdersCount}
              </Text>
              <Text style={styles.statsLabelDark}>Orders Today</Text>
            </View>
          </View>
        </View>

        {/* Custom JS Bar Chart Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Sales</Text>
          <View style={styles.chartContainer}>
            <View style={styles.customBarsWrapper}>
              {customBarData.map((bar, index) => {
                const heightPercentage = (bar.value / maxBarValue) * 100;
                return (
                  <View key={index} style={styles.customBarColumn}>
                    <Text style={styles.customBarValue}>{bar.value}</Text>
                    <View style={styles.customBarTrack}>
                      <View
                        style={[
                          styles.customBarFill,
                          {
                            height: `${heightPercentage}%`,
                            backgroundColor: bar.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.customBarLabel}>{bar.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.navigate("/bills")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {data.todaysOrderData.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderIcon}>
                <Ionicons
                  name="receipt"
                  size={20}
                  color={BrandColors.primary}
                />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>Order #{order.id}</Text>
                <Text style={styles.orderMeta}>
                  {order.items?.length || 1} items • {order.createdAt}
                </Text>
              </View>
              <View style={styles.orderAmount}>
                <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
                <View style={styles.statusBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={BrandColors.success}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xxl * 2 }} />
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
    backgroundColor: BrandColors.primary,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  businessName: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.white,
  },
  dateText: {
    fontSize: FontSizes.md,
    color: BrandColors.white + "80",
    marginTop: Spacing.xs,
  },
  subscriptionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: BrandColors.white + "26",
    borderWidth: 1,
    borderColor: BrandColors.white + "3D",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  subscriptionText: {
    fontSize: FontSizes.sm,
    color: BrandColors.black,
    fontWeight: "600",
  },
  subscriptionStatusDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: BrandColors.white,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.white + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.accent,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
  },
  subscriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.primary + "33",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
  },
  renewButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.primary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsCard: {
    flex: 1,
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: BrandColors.primary,
  },
  statsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  accentIcon: {
    backgroundColor: BrandColors.accent + "15",
  },
  statsValue: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.white,
  },
  statsValueDark: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  statsLabel: {
    fontSize: FontSizes.sm,
    color: BrandColors.white + "80",
    marginTop: Spacing.xs,
  },
  statsLabelDark: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: FontSizes.md,
    color: BrandColors.primary,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "22%",
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[700],
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  orderMeta: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  orderAmount: {
    alignItems: "flex-end",
  },
  orderTotal: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  statusBadge: {
    marginTop: Spacing.xs,
  },
  customBarsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
    width: "100%",
    paddingTop: Spacing.md,
  },
  customBarColumn: {
    alignItems: "center",
    width: 40,
    height: "100%",
    justifyContent: "flex-end",
  },
  customBarValue: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[600],
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  customBarTrack: {
    width: 24,
    height: 120,
    backgroundColor: BrandColors.gray[100],
    borderRadius: BorderRadius.sm,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  customBarFill: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  customBarLabel: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[700],
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  skeletonHeader: {
    width: "100%",
    height: 80,
    backgroundColor: BrandColors.gray[200],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  skeletonStatsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  skeletonCard: {
    flex: 1,
    height: 100,
    backgroundColor: BrandColors.gray[200],
    borderRadius: BorderRadius.lg,
  },
  skeletonChartPlaceholder: {
    width: "100%",
    height: 250,
    backgroundColor: BrandColors.gray[200],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
});
