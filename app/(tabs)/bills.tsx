import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { InvoiceFilterType, useApiInvoices } from "@/hooks/use-api-invoices";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

const FILTER_TYPE_MAP: Record<string, InvoiceFilterType> = {
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

const formatBillDate = (dateValue?: string) => {
  if (!dateValue) return "-";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AllBillsScreen() {
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
    data: bills = [],
    isLoading,
    isError,
    refetch,
  } = useApiInvoices({
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
    } else setFromDateError("");

    if (!isValidDateFormat(toDate)) {
      setToDateError("Use YYYY-MM-DD");
      hasError = true;
    } else setToDateError("");

    if (hasError) return;

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedFilter("Custom");
    setShowFilterModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>Manage your transactions</Text>
        </View>
        <TouchableOpacity
          style={styles.filterTrigger}
          onPress={() => {
            setSelectedFilter(appliedFilter);
            setShowFilterModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color={BrandColors.primary} />
          <Text style={styles.filterTriggerText}>{appliedFilter}</Text>
          <Ionicons name="chevron-down" size={14} color={BrandColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerSection}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={styles.centerText}>Fetching orders...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerSection}>
            <Ionicons name="alert-circle-outline" size={64} color={BrandColors.danger} />
            <Text style={styles.centerText}>Connection failed</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : bills.length === 0 ? (
          <View style={styles.centerSection}>
            <Ionicons name="receipt-outline" size={64} color={BrandColors.gray[200]} />
            <Text style={styles.centerText}>No orders found for this period</Text>
          </View>
        ) : (
          bills.map((bill, i) => (
            <View key={bill.id || i} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="receipt" size={24} color={BrandColors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                   <Text style={styles.cardId} numberOfLines={1}>#{(bill.friendlyId || "000").slice(-6)}</Text>
                   <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>{bill.status || "PAID"}</Text>
                   </View>
                </View>
                <Text style={styles.cardDate}>{formatBillDate(bill.createdAt)}</Text>
                <View style={styles.cardFooter}>
                   <Text style={styles.cardQty}>{bill.items?.length || 0} items</Text>
                   <Text style={styles.cardAmt}>₹{(bill.totalAmount || 0).toLocaleString("en-IN")}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Time Period</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={BrandColors.gray[900]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptionsScroll}>
              {DATE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.option, selectedFilter === f && styles.optionActive]}
                  onPress={() => handleFilterSelect(f)}
                >
                  <Text style={[styles.optionText, selectedFilter === f && styles.optionTextActive]}>{f}</Text>
                  {selectedFilter === f && (
                    <Ionicons name="checkmark-circle" size={20} color={BrandColors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {selectedFilter === "Custom" && (
                <View style={styles.customPicker}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>From Date</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={fromDate}
                      onChangeText={setFromDate}
                      placeholder="YYYY-MM-DD"
                    />
                    {!!fromDateError && <Text style={styles.errorText}>{fromDateError}</Text>}
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>To Date</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={toDate}
                      onChangeText={setToDate}
                      placeholder="YYYY-MM-DD"
                    />
                    {!!toDateError && <Text style={styles.errorText}>{toDateError}</Text>}
                  </View>
                  <TouchableOpacity style={styles.applyBtn} onPress={applyCustomFilter}>
                    <Text style={styles.applyBtnText}>Apply Selection</Text>
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.gray[900],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    fontWeight: "500",
  },
  filterTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "10",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.primary + "20",
  },
  filterTriggerText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    flexGrow: 1,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  centerText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[400],
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  retryBtn: {
    marginTop: Spacing.xl,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    color: BrandColors.white,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary + "08",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardId: {
    fontSize: FontSizes.md,
    fontWeight: "800",
    color: BrandColors.gray[900],
    flex: 1,
  },
  cardBadge: {
    backgroundColor: BrandColors.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.success,
    textTransform: "uppercase",
  },
  cardDate: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[400],
    marginTop: 2,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[50],
  },
  cardQty: {
    fontSize: 12,
    color: BrandColors.gray[600],
    fontWeight: "600",
  },
  cardAmt: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingBottom: Spacing.xxl,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  filterOptionsScroll: {
    padding: Spacing.xl,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  optionActive: {
    borderBottomColor: BrandColors.primary + "30",
  },
  optionText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    fontWeight: "600",
  },
  optionTextActive: {
    color: BrandColors.primary,
    fontWeight: "800",
  },
  customPicker: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.xl,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.gray[400],
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  fieldInput: {
    backgroundColor: BrandColors.white,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    fontWeight: "600",
    borderColor: BrandColors.gray[200],
    borderWidth: 1,
  },
  errorText: {
    color: BrandColors.danger,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
  applyBtn: {
    backgroundColor: BrandColors.primary,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  applyBtnText: {
    color: BrandColors.white,
    fontWeight: "800",
    fontSize: FontSizes.md,
  },
});
