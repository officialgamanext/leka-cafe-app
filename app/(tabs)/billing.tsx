import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
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
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLEPrinter } from "react-native-thermal-receipt-printer-image-qr";
import Toast from "react-native-toast-message";

// const categories = ["All", "Coffee", "Snacks", "Food"];

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
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

      const printSettings = currentBusiness?.printSettings;

      // Cafe Name (always printed)
      billText += "<C>" + (currentBusiness?.name || "CAFE") + "</C>\n";

      // Address section
      if (printSettings?.showAddress !== false) {
        const address = currentBusiness?.address;
        const fullAddress = address
          ? `${address.line1 || ""} ${address.line2 || ""}\n${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`
          : "";
        if (fullAddress.trim()) {
          fullAddress.split("\n").forEach((line) => {
            if (line.trim()) {
              billText += `<C>${line.trim()}</C>\n`;
            }
          });
        }
        if (currentBusiness?.leagalInfo?.gstNumber) {
          billText += `<C>GST: ${currentBusiness.leagalInfo.gstNumber}</C>\n`;
        }
      }

      // Phone section
      if (printSettings?.showPhone !== false && currentBusiness?.contact?.phone) {
        billText += `<C>Ph: ${currentBusiness.contact.phone}</C>\n`;
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
        `Tax (${currentBusiness?.defaultTaxRate || 0}%) ${currentBusiness?.defaultTaxComputationMethod || "exclusive"}`.padEnd(20) +
        `Rs.${tax.toFixed(2)}`.padStart(10);
      const totalLineText =
        "Total".padEnd(20) + `Rs.${total.toFixed(2)}`.padStart(10);

      billText += subtotalLine + "\n";
      if (printSettings?.showTax !== false) {
        billText += taxLine + "\n";
      }
      billText += "=".repeat(32) + "\n";
      billText += totalLineText + "\n";
      billText += "=".repeat(32) + "\n\n";

      // Thank You message
      if (printSettings?.showThankyou !== false) {
        billText += "<C>Thank You!</C>\n";
        billText += "<C>Visit Again</C>\n\n\n";
      } else {
        billText += "\n\n";
      }

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
        activeOpacity={0.8}
      >
        <View style={styles.menuItemImage}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          {inBill && (
             <View style={styles.selectionIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={BrandColors.white} />
                <View style={styles.selectionQuantity}>
                   <Text style={styles.selectionQuantityText}>{inBill.quantity}</Text>
                </View>
             </View>
          )}
        </View>
        <View style={styles.menuItemInfo}>
          <Text style={[styles.menuItemName, inBill && styles.menuItemNameActive]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.menuItemPrice, inBill && styles.menuItemPriceActive]}>Rs.{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{ height: insets.top, backgroundColor: BrandColors.white }}
      />
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Create Bill</Text>
          <Text style={styles.headerSubtitle}>Select items for the order</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBillButton}
          onPress={() => setShowBillModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={24} color={BrandColors.white} />
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

      {/* Floating Bill Summary */}
      {billItems.length > 0 && (
        <View style={styles.billSummaryContainer}>
          <TouchableOpacity
            style={styles.billSummary}
            onPress={() => setShowBillModal(true)}
            activeOpacity={0.9}
          >
            <View style={styles.billInfo}>
              <Text style={styles.billItemCount}>
                {billItems.length} items selected
              </Text>
              <Text style={styles.billTotal}>₹{total.toFixed(2)}</Text>
            </View>
            <View style={styles.billActions}>
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleSaveBill}
                disabled={isCreatingInvoice}
              >
                {isCreatingInvoice ? (
                  <ActivityIndicator color={BrandColors.white} size="small" />
                ) : (
                  <Ionicons name="save" size={20} color={BrandColors.white} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionIconButton, styles.printActionButton]}
                onPress={handlePrintBill}
              >
                <Ionicons name="print" size={20} color={BrandColors.white} />
              </TouchableOpacity>
              <View style={styles.viewBillCta}>
                <Text style={styles.viewBillText}>Review</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={BrandColors.white}
                />
              </View>
            </View>
          </TouchableOpacity>
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
                    <Text style={styles.totalLabel}>Tax ({currentBusiness?.defaultTaxRate || 0}% {currentBusiness?.defaultTaxComputationMethod || "exclusive"})</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: "800",
    color: BrandColors.gray[900],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  viewBillButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BrandColors.white,
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.white,
  },
  categoriesContainer: {
    backgroundColor: BrandColors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.lg,
    backgroundColor: BrandColors.gray[100],
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
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
    padding: Spacing.lg,
    paddingBottom: 150,
  },
  menuRow: {
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Shadows.sm,
  },
  menuItemSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.white,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItemImage: {
    width: "100%",
    height: 100,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
    overflow: "visible", // To allow badge to overflow slightly if needed
  },
  menuItemInfo: {
    marginTop: Spacing.xs,
  },
  menuItemName: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[800],
  },
  menuItemNameActive: {
    color: BrandColors.primary,
    fontWeight: "800",
  },
  menuItemPrice: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.primary,
    marginTop: 2,
  },
  menuItemPriceActive: {
    color: BrandColors.primaryDark,
    fontWeight: "800",
  },
  selectionIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.full,
    paddingRight: 8,
    paddingLeft: 2,
    paddingVertical: 2,
    ...Shadows.md,
  },
  selectionQuantity: {
    marginLeft: 4,
  },
  selectionQuantityText: {
    fontSize: 11,
    fontWeight: "900",
    color: BrandColors.white,
  },
  quantityBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BrandColors.white,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "800",
    color: BrandColors.white,
  },
  billSummaryContainer: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  billSummary: {
    backgroundColor: BrandColors.gray[900],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  billInfo: {
    flex: 1,
    paddingLeft: Spacing.xs,
  },
  billItemCount: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: BrandColors.white,
    opacity: 0.6,
    fontWeight: "700",
  },
  billTotal: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.white,
    marginTop: 2,
  },
  billActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  printActionButton: {
    backgroundColor: BrandColors.white + "25",
  },
  viewBillCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginLeft: 4,
  },
  viewBillText: {
    color: BrandColors.white,
    fontWeight: "700",
    fontSize: FontSizes.md,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  emptyBill: {
    padding: Spacing.xxxl,
    alignItems: "center",
  },
  emptyBillText: {
    fontSize: FontSizes.lg,
    color: BrandColors.gray[400],
    marginTop: Spacing.md,
    fontWeight: "600",
  },
  billItemsList: {
    paddingHorizontal: Spacing.lg,
  },
  billItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  billItemInfo: {
    flex: 1,
  },
  billItemName: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[800],
  },
  billItemPrice: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.md,
    padding: 4,
    marginRight: Spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  quantityValue: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[900],
    paddingHorizontal: Spacing.md,
  },
  billItemSubtotal: {
    fontSize: FontSizes.md,
    fontWeight: "800",
    color: BrandColors.gray[900],
    textAlign: "right",
    minWidth: 80,
  },
  billTotals: {
    padding: Spacing.xl,
    backgroundColor: BrandColors.gray[50],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[100],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    fontWeight: "600",
  },
  totalValue: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[800],
    fontWeight: "700",
  },
  grandTotalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
  },
  grandTotalLabel: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  grandTotalValue: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.primary,
  },
  modalActions: {
    flexDirection: "row",
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    gap: Spacing.md,
  },
  clearButton: {
    flex: 0.5,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[600],
  },
  printModalButton: {
    flex: 0.5,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  printModalButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.white,
  },
});
