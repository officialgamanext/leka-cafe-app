import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ItemsScreen() {
  const insets = useSafeAreaInsets();
  const {
    menuItems,
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
  const { mutate: deleteProduct } =
    useDeleteProduct();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
    imgUrl: "",
  });

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openAddModal = () => {
    if (categoryItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Categories",
        text2: "Please create a category first",
      });
      return;
    }
    setEditingItem(null);
    setFormData({
      name: "",
      price: "",
      categoryId: categoryItems[0]?.id || "",
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

  const handleSaveItem = () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      Toast.show({ type: "error", text1: "Validation", text2: "Name and price are required" });
      return;
    }

    const itemPayload: Omit<MenuItem, "id"> = {
      name: formData.name,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      description: formData.description,
      imgUrl: formData.imgUrl,
      isAvailable: true,
    };

    if (editingItem) {
      updateProduct(
        { tenantId: currentBusiness?.id || "", productId: editingItem.id, product: itemPayload },
        {
          onSuccess: () => {
            Toast.show({ type: "success", text1: "Updated", text2: "Item successfully updated" });
            setShowModal(false);
          },
          onError: (error) => {
            Toast.show({ type: "error", text1: "Error", text2: error.message || "Failed update" });
          },
        }
      );
    } else {
      createProduct(
        { tenantId: currentBusiness?.id || "", product: itemPayload },
        {
          onSuccess: () => {
            Toast.show({ type: "success", text1: "Added", text2: "New item added to menu" });
            setShowModal(false);
          },
          onError: (error) => {
            Toast.show({ type: "error", text1: "Error", text2: error.message || "Failed add" });
          },
        }
      );
    }
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert("Delete Item", `Remove "${item.name}" from menu?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteProduct({ tenantId: currentBusiness?.id || "", productId: item.id }, {
            onSuccess: () => Toast.show({ type: "success", text1: "Deleted" }),
          });
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onLongPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImage}>
        {item.imgUrl ? (
          <Image source={{ uri: item.imgUrl }} style={styles.img} />
        ) : (
          <Ionicons name="cafe-outline" size={24} color={BrandColors.primary} />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardType}>{item.category || "General"}</Text>
        <Text style={styles.cardPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={18} color={BrandColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actBtn, { backgroundColor: BrandColors.danger + "05" }]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={BrandColors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu Catalog</Text>
          <Text style={styles.headerSubtitle}>Manage recipes and items</Text>
        </View>
        <TouchableOpacity style={styles.headerAdd} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={BrandColors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={BrandColors.gray[400]} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={BrandColors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
             <Ionicons name="close-circle" size={18} color={BrandColors.gray[300]} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="fast-food-outline" size={64} color={BrandColors.gray[200]} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingItem ? "Update Item" : "Create Item"}</Text>
                <Text style={styles.modalSubtitle}>Fill in the delicious details</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeModal}>
                <Ionicons name="close" size={24} color={BrandColors.gray[900]} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.field}>
                <Text style={styles.label}>Product Name</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.name} 
                  onChangeText={(t) => setFormData({...formData, name: t})}
                  placeholder="e.g. Mocha Blast"
                />
              </View>

              <View style={[styles.field, { width: "50%" }]}>
                <Text style={styles.label}>Price (₹)</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.price} 
                  onChangeText={(t) => setFormData({...formData, price: t})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRoll}>
                   {categoryItems.map((cat) => (
                     <TouchableOpacity 
                       key={cat.id} 
                       onPress={() => setFormData({...formData, categoryId: cat.id})}
                       style={[styles.catPill, formData.categoryId === cat.id && styles.catPillActive]}
                     >
                       <Text style={[styles.catPillText, formData.categoryId === cat.id && styles.catPillTextActive]}>{cat.name}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]} 
                  value={formData.description} 
                  onChangeText={(t) => setFormData({...formData, description: t})}
                  placeholder="Tell clients about this item..."
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.submit} onPress={handleSaveItem}>
                {isCreatingProduct || isUpdatingProduct ? (
                  <ActivityIndicator color={BrandColors.white} />
                ) : (
                  <Text style={styles.submitText}>{editingItem ? "Save Changes" : "Create Item"}</Text>
                )}
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
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
  headerAdd: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  list: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary + "08",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardName: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  cardType: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.gray[400],
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  cardPrice: {
    fontSize: FontSizes.md,
    fontWeight: "800",
    color: BrandColors.primary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[200],
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingBottom: Spacing.xxl,
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
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    fontWeight: "500",
  },
  closeModal: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BrandColors.gray[50],
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  catRoll: {
    flexDirection: "row",
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: BrandColors.gray[200],
  },
  catPillActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.gray[600],
  },
  catPillTextActive: {
    color: BrandColors.white,
  },
  submit: {
    backgroundColor: BrandColors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  submitText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "800",
  },
});
