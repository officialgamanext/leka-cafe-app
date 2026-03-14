import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import { useCreateInvoice } from "@/hooks/use-api-invoices";
import { MenuItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BLEPrinter } from "react-native-thermal-receipt-printer-image-qr";
import Toast from "react-native-toast-message";

// const categories = ["All", "Coffee", "Snacks", "Food"];

export default function BillingScreen() {
  const {
    menuItems,
    billItems,
    addToBill,
    updateQuantity,
    clearBill,
    calculateTotal,
    categoryItems,
  } = useBilling();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBillModal, setShowBillModal] = useState(false);
  const { getToken, currentBusiness } = useAuth();
  const { mutate: createInvoice, isPending: isCreatingInvoice } =
    useCreateInvoice();

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  const { subtotal, tax, total } = calculateTotal();

  const handleAddItem = (item: MenuItem) => {
    addToBill(item);
  };

  const handleSaveBill = async () => {
    if (billItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Empty Bill",
        text2: "Please add items to create a bill",
      });
      return;
    }
    try {
      const payload = {
        tenantId: currentBusiness?.id || "",
        invoice: {
          tenantId: currentBusiness?.id || "",
          customerName: "Customer",
          customerPhone: "0000000000",
          items: billItems.map((bi) => ({
            productId: bi.menuItem.id,
            productName: bi.menuItem.name,
            quantity: bi.quantity,
            unitPrice: bi.menuItem.price,
            totalPrice: bi.subtotal,
          })),
          // totalAmount: total,
          // subTotal: subtotal,
          // tax,
          discount: 0,
          paymentMethod: "cash" as const,
          status: "paid" as const,
          // createdAt: new Date().toISOString(),
        },
      };

      createInvoice(payload, {
        onSuccess: (data) => {
          Toast.show({
            type: "success",
            text1: "Bill Saved",
            text2: `Bill of Rs.${data.data.totalAmount.toFixed(2)} has been saved successfully!`,
          });
          clearBill();
          setShowBillModal(false);
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              error.message || "Failed to save the bill. Please try again.",
          });
        },
      });
    } catch (error) {
      console.error("Error saving bill:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save the bill. Please try again.",
      });
    }
  };

  const handlePrintBill = async () => {
    if (billItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Empty Bill",
        text2: "Please add items to print a bill",
      });
      return;
    }

    try {
      Toast.show({
        type: "info",
        text1: "Printing & Saving",
        text2: "Printing bill and saving...",
      });

      // Build a simple and clean bill format
      let billText = "";

      // Cafe Name and Address
      billText += "<C><B>" + (currentBusiness?.name || "CAFE") + "</B></C>\n";
      const address = currentBusiness?.address;
      const fullAddress = address
        ? `${address.line1 || ""} ${address.line2 || ""}\n${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`
        : "";
      if (fullAddress.trim()) {
        billText += `<C>${fullAddress.trim()}</C>\n`;
      }
      if (currentBusiness?.leagalInfo?.gstNumber) {
        billText += `<C>GST: ${currentBusiness.leagalInfo.gstNumber}</C>\n`;
      }
      billText += "\n" + "=".repeat(32) + "\n\n";

      // Items
      billItems.forEach((item) => {
        const itemName = item.menuItem.name.substring(0, 20);
        const qty = item.quantity;
        const price = item.subtotal.toFixed(2);
        const line =
          `${itemName} x${qty}`.padEnd(20) + `Rs.${price}`.padStart(10);
        billText += line + "\n";
      });

      billText += "\n" + "-".repeat(32) + "\n";

      // Totals
      const subtotalLine =
        "Subtotal".padEnd(20) + `Rs.${subtotal.toFixed(2)}`.padStart(10);
      const taxLine =
        "Tax (5%)".padEnd(20) + `Rs.${tax.toFixed(2)}`.padStart(10);
      const totalLineText =
        "Total".padEnd(20) + `Rs.${total.toFixed(2)}`.padStart(10);

      billText += subtotalLine + "\n";
      billText += taxLine + "\n";
      billText += "=".repeat(32) + "\n";
      billText += totalLineText + "\n";
      billText += "=".repeat(32) + "\n\n";

      // Thank You Message
      billText += "<C>Thank You!</C>\n";
      billText += "<C>Visit Again</C>\n\n\n";

      // Print the bill first
      await BLEPrinter.printText(billText);

      Toast.show({
        type: "success",
        text1: "Bill Printed",
        text2: "Saving bill...",
      });

      // Then save the bill
      const payload = {
        tenantId: currentBusiness?.id || "",
        invoice: {
          tenantId: currentBusiness?.id || "",
          customerName: "Customer",
          customerPhone: "0000000000",
          items: billItems.map((bi) => ({
            productId: bi.menuItem.id,
            productName: bi.menuItem.name,
            quantity: bi.quantity,
            unitPrice: bi.menuItem.price,
            totalPrice: bi.subtotal,
          })),
          discount: 0,
          paymentMethod: "cash" as const,
          status: "paid" as const,
        },
      };

      await new Promise<void>((resolve, reject) => {
        createInvoice(payload, {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Bill printed and saved successfully!",
            });
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        });
      });

      // Clear the bill after successful print and save
      clearBill();
      setShowBillModal(false);
    } catch (error) {
      console.error("Print/Save error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to print or save bill. Please try again.",
      });
    }
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const inBill = billItems.find((bi) => bi.menuItem.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.menuItem, inBill && styles.menuItemSelected]}
        onPress={() => handleAddItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemImage}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
        </View>
        {inBill && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{inBill.quantity}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Bill</Text>
        <TouchableOpacity
          style={styles.viewBillButton}
          onPress={() => setShowBillModal(true)}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color={BrandColors.white}
          />
          {billItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{billItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            key={"All"}
            style={[
              styles.categoryButton,
              selectedCategory === "All" && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory("All")}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === "All" && styles.categoryTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categoryItems?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        numColumns={2}
        contentContainerStyle={styles.menuGrid}
        columnWrapperStyle={styles.menuRow}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bill Summary */}
      {billItems.length > 0 && (
        <View style={styles.billSummary}>
          <View style={styles.billInfo}>
            <Text style={styles.billItemCount}>{billItems.length} items</Text>
            <Text style={styles.billTotal}>Rs.{total.toFixed(2)}</Text>
          </View>
          <View style={styles.billActions}>
            <TouchableOpacity
              style={styles.openSummaryButton}
              onPress={() => setShowBillModal(true)}
            >
              <Ionicons
                name="chevron-up"
                size={24}
                color={BrandColors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBill}
              disabled={isCreatingInvoice}
              accessibilityLabel="Save Bill"
            >
              {isCreatingInvoice ? (
                <ActivityIndicator color={BrandColors.white} size="small" />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={20}
                  color={BrandColors.white}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.printButton}
              onPress={handlePrintBill}
              accessibilityLabel="Print Bill"
            >
              <Ionicons
                name="print-outline"
                size={20}
                color={BrandColors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bill Detail Modal */}
      <Modal
        visible={showBillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Current Bill</Text>
              <TouchableOpacity onPress={() => setShowBillModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={BrandColors.gray[600]}
                />
              </TouchableOpacity>
            </View>

            {billItems.length === 0 ? (
              <View style={styles.emptyBill}>
                <Ionicons
                  name="receipt-outline"
                  size={64}
                  color={BrandColors.gray[300]}
                />
                <Text style={styles.emptyBillText}>No items added yet</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.billItemsList}>
                  {billItems.map((item) => (
                    <View key={item.id} style={styles.billItem}>
                      <View style={styles.billItemInfo}>
                        <Text style={styles.billItemName}>
                          {item.menuItem.name}
                        </Text>
                        <Text style={styles.billItemPrice}>
                          Rs.{item.menuItem.price} × {item.quantity}
                        </Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={BrandColors.primary}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Ionicons
                            name="add"
                            size={18}
                            color={BrandColors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.billItemSubtotal}>
                        Rs.{item.subtotal}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.billTotals}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>
                      Rs.{subtotal.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax (5%)</Text>
                    <Text style={styles.totalValue}>Rs.{tax.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total</Text>
                    <Text style={styles.grandTotalValue}>
                      Rs.{total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      clearBill();
                      setShowBillModal(false);
                    }}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.printModalButton}
                    onPress={handlePrintBill}
                  >
                    <Ionicons
                      name="print-outline"
                      size={18}
                      color={BrandColors.gray[800]}
                    />
                    <Text style={styles.printModalButtonText}>Print</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      if (!isCreatingInvoice) {
                        handleSaveBill();
                        // Note: modal closing relies on the success callback now
                      }
                    }}
                    disabled={isCreatingInvoice}
                  >
                    {isCreatingInvoice ? (
                      <ActivityIndicator
                        color={BrandColors.white}
                        size="small"
                      />
                    ) : (
                      <Text style={styles.confirmButtonText}>Save Bill</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  viewBillButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: "700",
    color: BrandColors.white,
  },
  categoriesContainer: {
    backgroundColor: BrandColors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: BrandColors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: BrandColors.primary,
  },
  categoryText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[600],
  },
  categoryTextActive: {
    color: BrandColors.white,
  },
  menuGrid: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  menuRow: {
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemSelected: {
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  menuItemImage: {
    width: "100%",
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  menuItemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  menuItemPrice: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  quantityBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: BrandColors.white,
  },
  billSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  billInfo: {
    flex: 1,
  },
  billItemCount: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[600],
  },
  billTotal: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  billActions: {
    flexDirection: "row",
    gap: Spacing.xs,
    alignItems: "center",
  },
  openSummaryButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  saveButton: {
    backgroundColor: BrandColors.danger,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
  },
  printButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
  },
  printButtonText: {
    fontSize: FontSizes.md,
    color: BrandColors.white,
    fontWeight: "600",
  },
  buttonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  emptyBill: {
    padding: Spacing.xxl,
    alignItems: "center",
  },
  emptyBillText: {
    fontSize: FontSizes.lg,
    color: BrandColors.gray[500],
    marginTop: Spacing.md,
  },
  billItemsList: {
    maxHeight: 300,
    padding: Spacing.lg,
  },
  billItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  billItemInfo: {
    flex: 1,
  },
  billItemName: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  billItemPrice: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginRight: Spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
    minWidth: 24,
    textAlign: "center",
  },
  billItemSubtotal: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    minWidth: 70,
    textAlign: "right",
  },
  billTotals: {
    padding: Spacing.lg,
    backgroundColor: BrandColors.gray[50],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  totalValue: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[800],
  },
  grandTotalRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[300],
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  grandTotalValue: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  modalActions: {
    flexDirection: "row",
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  clearButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.danger + "20",
    borderWidth: 1,
    borderColor: BrandColors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.danger,
  },
  printModalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[100],
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  printModalButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[800],
  },
  confirmButton: {
    flex: 1.5,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  confirmButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.white,
  },
});
