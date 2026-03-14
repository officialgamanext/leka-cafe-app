import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const mockSoldItems = [
  { id: "1", name: "Cappuccino", quantity: 45, total: 6750 },
  { id: "2", name: "Latte", quantity: 38, total: 5700 },
  { id: "3", name: "Espresso", quantity: 25, total: 2500 },
  { id: "4", name: "Avocado Toast", quantity: 18, total: 3600 },
  { id: "5", name: "Croissant", quantity: 15, total: 1350 },
  { id: "6", name: "Iced Tea", quantity: 12, total: 1200 },
];

export default function ReportsScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    if (filter !== "Custom") {
      setShowFilterModal(false);
    }
  };

  const applyCustomFilter = () => {
    setShowFilterModal(false);
  };

  const totalItemsSold = mockSoldItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalRevenue = mockSoldItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <SafeAreaView style={styles.container}>
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
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color={BrandColors.primary} />
          <Text style={styles.filterText}>{selectedFilter}</Text>
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

        {mockSoldItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemIcon}>
              <Ionicons
                name="fast-food"
                size={24}
                color={BrandColors.primary}
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.quantity} sold</Text>
            </View>
            <View style={styles.itemAmountContainer}>
              <Text style={styles.itemAmount}>₹{item.total}</Text>
            </View>
          </View>
        ))}
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
                  <Text style={styles.inputLabel}>To Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={toDate}
                    onChangeText={setToDate}
                    placeholder="2026-12-31"
                  />
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
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
