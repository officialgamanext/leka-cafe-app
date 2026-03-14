import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import {
    useCreateProduct,
    useDeleteProduct,
    useUpdateProduct,
} from "@/hooks/use-api-products";
import { MenuItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// const categories = ["Coffee", "Snacks", "Food", "Beverages", "Desserts"];

export default function ItemsScreen() {
  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    categoryItems,
  } = useBilling();
  const { currentBusiness } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { mutate: createProduct, isPending: isCreatingProduct } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatingProduct } =
    useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeletingProduct } =
    useDeleteProduct();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "Coffee",
    description: "",
    imgUrl: "",
  });

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openAddModal = () => {
    // Check if categories exist
    if (categoryItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Categories",
        text2: "Please create a category first in the Categories section",
      });
      return;
    }

    setEditingItem(null);
    setFormData({
      name: "",
      price: "",
      categoryId: categoryItems[0]?.id || "", // Use first category from API
      description: "",
      imgUrl: "",
    });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      categoryId: item.categoryId || "",
      description: item.description || "",
      imgUrl: item.imgUrl || "",
    });
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter item name",
      });
      return false;
    }
    if (!formData.price.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter price",
      });
      return false;
    }
    if (isNaN(parseFloat(formData.price))) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Price must be a valid number",
      });
      return false;
    }
    if (!formData.categoryId) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a category",
      });
      return false;
    }
    return true;
  };

  const handleSaveItem = () => {
    if (!validateForm()) return;

    const itemPayload: Omit<MenuItem, "id"> = {
      name: formData.name,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      description: formData.description,
      imgUrl: formData.imgUrl,
      isAvailable: true,
    };

    if (editingItem) {
      // Update item
      updateProduct(
        {
          tenantId: currentBusiness?.id || "",
          productId: editingItem.id,
          product: itemPayload,
        },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Item updated successfully",
            });
            setShowModal(false);
          },
          onError: (error) => {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error.message || "Failed to update item",
            });
          },
        },
      );
    } else {
      // Create new item
      createProduct(
        {
          tenantId: currentBusiness?.id || "",
          product: itemPayload,
        },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Item added successfully",
            });
            setShowModal(false);
          },
          onError: (error) => {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error.message || "Failed to add item",
            });
          },
        },
      );
    }
  };

  // const handleSave = () => {
  //   if (!formData.name.trim()) {
  //     Alert.alert("Error", "Please enter item name");
  //     return;
  //   }
  //   if (!formData.price || isNaN(Number(formData.price))) {
  //     Alert.alert("Error", "Please enter a valid price");
  //     return;
  //   }

  //   if (editingItem) {
  //     updateMenuItem(editingItem.id, {
  //       name: formData.name,
  //       price: Number(formData.price),
  //       categoryId: formData.categoryId,
  //       description: formData.description,
  //       imgUrl: formData.imgUrl,
  //     });
  //     Alert.alert("Success", "Item updated successfully");
  //   } else {
  //     addMenuItem({
  //       name: formData.name,
  //       price: Number(formData.price),
  //       categoryId: formData.categoryId,
  //       description: formData.description,
  //       imgUrl: formData.imgUrl,
  //       isAvailable: true,
  //     });
  //     Alert.alert("Success", "Item added successfully");
  //   }
  //   setShowModal(false);
  // };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProduct(
              {
                tenantId: currentBusiness?.id || "",
                productId: item.id,
              },
              {
                onSuccess: () => {
                  Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Item deleted successfully",
                  });
                },
                onError: (error) => {
                  Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: error.message || "Failed to delete item",
                  });
                },
              },
            );
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        {item.imgUrl ? (
          <Image source={{ uri: item.imgUrl }} style={styles.itemImage} />
        ) : (
          <Ionicons name="cafe" size={32} color={BrandColors.primary} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color={BrandColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          disabled={isDeletingProduct}
        >
          <Ionicons name="trash" size={16} color={BrandColors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Items</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={BrandColors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={BrandColors.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={BrandColors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={BrandColors.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Items Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{filteredItems.length} items</Text>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cafe-outline"
              size={64}
              color={BrandColors.gray[300]}
            />
            <Text style={styles.emptyText}>No items found</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? "Edit Item" : "Add New Item"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={BrandColors.gray[600]}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Preview */}
              <View style={styles.imagePreview}>
                {formData.imgUrl ? (
                  <Image
                    source={{ uri: formData.imgUrl }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={48}
                      color={BrandColors.gray[400]}
                    />
                    <Text style={styles.imagePlaceholderText}>Item Image</Text>
                  </View>
                )}
              </View>

              {/* Image URL Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={BrandColors.gray[400]}
                  value={formData.imgUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, imgUrl: text })
                  }
                />
              </View>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Cappuccino"
                  placeholderTextColor={BrandColors.gray[400]}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              {/* Price Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 180"
                  placeholderTextColor={BrandColors.gray[400]}
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                />
              </View>

              {/* Category Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                {categoryItems.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryOptions}>
                      {categoryItems.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryOption,
                            formData.categoryId === cat.id &&
                              styles.categoryOptionActive,
                          ]}
                          onPress={() =>
                            setFormData({ ...formData, categoryId: cat.id })
                          }
                        >
                          <Text
                            style={[
                              styles.categoryOptionText,
                              formData.categoryId === cat.id &&
                                styles.categoryOptionTextActive,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.noCategoriesContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color={BrandColors.danger}
                    />
                    <Text style={styles.noCategoriesText}>
                      No categories found. Please create categories first in the
                      Categories section.
                    </Text>
                  </View>
                )}
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief description of the item"
                  placeholderTextColor={BrandColors.gray[400]}
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveItem}
                disabled={isCreatingProduct || isUpdatingProduct}
              >
                {isCreatingProduct || isUpdatingProduct ? (
                  <ActivityIndicator color={BrandColors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingItem ? "Update" : "Add Item"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
  },
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  countText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  itemCard: {
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
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  itemCategory: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.primary,
    marginTop: Spacing.xs,
  },
  itemActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.danger + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: BrandColors.gray[500],
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: BrandColors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
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
    maxHeight: "90%",
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
  modalBody: {
    padding: Spacing.lg,
  },
  imagePreview: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[800],
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: BrandColors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.gray[100],
  },
  categoryOptionActive: {
    backgroundColor: BrandColors.primary,
  },
  categoryOptionText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[700],
  },
  categoryOptionTextActive: {
    color: BrandColors.white,
    fontWeight: "600",
  },
  noCategoriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.danger + "10",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  noCategoriesText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: BrandColors.danger,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: BrandColors.gray[300],
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[700],
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.white,
  },
});
