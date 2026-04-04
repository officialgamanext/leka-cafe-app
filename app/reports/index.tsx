import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  ReportFilterType,
  useApiProductSalesReport,
} from "@/hooks/use-api-reports";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DATE_FILTERS = [
  "Today",
  "Yesterday",
  "This week",
  "Last week",
  "This month",
  "Last Month",
  "This year",
  "Last Year",
  "Custom",
];

const FILTER_TYPE_MAP: Record<string, ReportFilterType> = {
  Today: "today",
  Yesterday: "yesterday",
  "This week": "thisWeek",
  "Last week": "lastWeek",
  "This month": "thisMonth",
  "Last Month": "lastMonth",
  "This year": "thisYear",
  "Last Year": "lastYear",
  Custom: "custom",
};

const isValidDateFormat = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { currentBusiness, isAuthenticated } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [appliedFilter, setAppliedFilter] = useState("Today");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");

  const selectedFilterType = FILTER_TYPE_MAP[appliedFilter] || "today";
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useApiProductSalesReport({
    tenantId: currentBusiness?.id,
    filters: {
      filterType: selectedFilterType,
      startDate: selectedFilterType === "custom" ? appliedFromDate : undefined,
      endDate: selectedFilterType === "custom" ? appliedToDate : undefined,
    },
    enabled: !!currentBusiness?.id && isAuthenticated,
  });

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    if (filter !== "Custom") {
      setAppliedFilter(filter);
      setShowFilterModal(false);
      setFromDateError("");
      setToDateError("");
    }
  };

  const applyCustomFilter = () => {
    let hasError = false;
    if (!isValidDateFormat(fromDate)) {
      setFromDateError("Use YYYY-MM-DD");
      hasError = true;
    } else {
      setFromDateError("");
    }

    if (!isValidDateFormat(toDate)) {
      setToDateError("Use YYYY-MM-DD");
      hasError = true;
    } else {
      setToDateError("");
    }

    if (hasError) return;

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedFilter("Custom");
    setShowFilterModal(false);
  };

  const productSales = report?.productWiseSales || [];
  const totalItemsSold = report?.totalItemsQuantitySold || 0;
  const totalRevenue = report?.totalInvoicesAmount || 0;

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={BrandColors.gray[900]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Sales Report</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setSelectedFilter(appliedFilter);
            setShowFilterModal(true);
          }}
        >
          <Ionicons name="filter" size={20} color={BrandColors.primary} />
          <Text style={styles.filterText}>{appliedFilter}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Items Sold</Text>
            <Text style={styles.summaryValue}>{totalItemsSold}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>₹{totalRevenue}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items Breakdown</Text>

        {isLoading ? (
          <View style={styles.centerSection}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={styles.centerText}>Loading report...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerSection}>
            <Ionicons
              name="alert-circle-outline"
              size={56}
              color={BrandColors.danger}
            />
            <Text style={styles.centerText}>Could not load report</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : productSales.length === 0 ? (
          <View style={styles.centerSection}>
            <Ionicons
              name="bar-chart-outline"
              size={56}
              color={BrandColors.gray[300]}
            />
            <Text style={styles.centerText}>No sales found for this period</Text>
          </View>
        ) : (
          productSales.map((item) => (
            <View key={item.productId} style={styles.itemCard}>
              {item.productImage ? (
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemIcon}>
                  <Ionicons
                    name="fast-food"
                    size={24}
                    color={BrandColors.primary}
                  />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.productName}</Text>
                <Text style={styles.itemQty}>{item.quantitySold} sold</Text>
              </View>
              <View style={styles.itemAmountContainer}>
                <Text style={styles.itemAmount}>
                  ₹{item.salesAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Range</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={BrandColors.gray[600]}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterList}>
              {DATE_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={styles.filterOption}
                  onPress={() => handleFilterSelect(filter)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === filter && styles.filterOptionActive,
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={BrandColors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {selectedFilter === "Custom" && (
                <View style={styles.customDateContainer}>
                  <Text style={styles.inputLabel}>From Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={fromDate}
                    onChangeText={setFromDate}
                    placeholder="2026-01-01"
                  />
                  {!!fromDateError && (
                    <Text style={styles.errorText}>{fromDateError}</Text>
                  )}
                  <Text style={styles.inputLabel}>To Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={toDate}
                    onChangeText={setToDate}
                    placeholder="2026-12-31"
                  />
                  {!!toDateError && (
                    <Text style={styles.errorText}>{toDateError}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyCustomFilter}
                  >
                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray[50],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "15",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.primary,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: BrandColors.white + "40",
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: BrandColors.white + "90",
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSizes.xxl,
    fontWeight: "bold",
    color: BrandColors.white,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.md,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  itemQty: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  itemAmountContainer: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  centerSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },
  centerText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: BrandColors.white,
    fontWeight: "600",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  filterList: {
    padding: Spacing.lg,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  filterOptionText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[700],
  },
  filterOptionActive: {
    color: BrandColors.primary,
    fontWeight: "600",
  },
  customDateContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[700],
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSizes.md,
  },
  errorText: {
    color: BrandColors.danger,
    fontSize: FontSizes.xs,
    marginTop: 4,
  },
  applyButton: {
    backgroundColor: BrandColors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  applyButtonText: {
    color: BrandColors.white,
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
});
