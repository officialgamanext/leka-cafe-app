import {
    BorderRadius,
    BrandColors,
    FontSizes,
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
import { SafeAreaView } from "react-native-safe-area-context";

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
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AllBillsScreen() {
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
      setFromDateError("Invalid date format. Use YYYY-MM-DD");
      hasError = true;
    } else {
      setFromDateError("");
    }

    if (!isValidDateFormat(toDate)) {
      setToDateError("Invalid date format. Use YYYY-MM-DD");
      hasError = true;
    } else {
      setToDateError("");
    }

    if (hasError) {
      return;
    }

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedFilter("Custom");
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Bills</Text>
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
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={styles.stateText}>Loading bills...</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Failed to load bills</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : bills.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No bills found</Text>
          </View>
        ) : (
          bills.map((bill, index) => (
            <View key={bill.id || String(index)} style={styles.billCard}>
              <View style={styles.billIcon}>
                <Ionicons
                  name="document-text"
                  size={24}
                  color={BrandColors.primary}
                />
              </View>
              <View style={styles.billInfo}>
                <Text style={styles.billTitle}>Bill #{bill.id || "-"}</Text>
                <Text style={styles.billDate}>
                  {formatBillDate(bill.createdAt)}
                </Text>
                <Text style={styles.billItems}>
                  {bill.items?.length || 0} items
                </Text>
              </View>
              <View style={styles.billAmountContainer}>
                <Text style={styles.billAmount}>
                  ₹{(bill.totalAmount || 0).toLocaleString("en-IN")}
                </Text>
                <Text style={styles.billStatus}>
                  {bill.status
                    ? `${bill.status.charAt(0).toUpperCase()}${bill.status.slice(1)}`
                    : "-"}
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
                    onChangeText={(value) => {
                      setFromDate(value);
                      if (fromDateError) {
                        setFromDateError("");
                      }
                    }}
                    placeholder="2026-01-01"
                  />
                  {!!fromDateError && (
                    <Text style={styles.inputErrorText}>{fromDateError}</Text>
                  )}
                  <Text style={styles.inputLabel}>To Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={toDate}
                    onChangeText={(value) => {
                      setToDate(value);
                      if (toDateError) {
                        setToDateError("");
                      }
                    }}
                    placeholder="2026-12-31"
                  />
                  {!!toDateError && (
                    <Text style={styles.inputErrorText}>{toDateError}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
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
  stateContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  stateText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.sm,
    fontWeight: "600",
  },
  billCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  billDate: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  billItems: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
  },
  billAmountContainer: {
    alignItems: "flex-end",
  },
  billAmount: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  billStatus: {
    fontSize: FontSizes.xs,
    color: BrandColors.success,
    fontWeight: "600",
    marginTop: 4,
    backgroundColor: BrandColors.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
  inputErrorText: {
    marginTop: 4,
    fontSize: FontSizes.xs,
    color: BrandColors.danger,
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
