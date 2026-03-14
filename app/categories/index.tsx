import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
    useApiCategories,
    useCreateCategory,
    useUpdateCategory,
} from "@/hooks/use-api-category";
import { Category } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const { currentBusiness } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const { data: categories = [], isLoading } = useApiCategories({
    tenantId: currentBusiness?.id,
    enabled: !!currentBusiness?.id,
  });

  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } =
    useUpdateCategory();

  const isSaving = isCreatingCategory || isUpdatingCategory;

  const resetAndCloseModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setShowAddModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name || "");
    setCategoryDescription(category.description || "");
    setShowAddModal(true);
  };

  const handleSaveCategory = () => {
    if (!currentBusiness?.id) {
      Alert.alert("Business not selected", "Please select a business first.");
      return;
    }

    if (!categoryName.trim()) {
      Alert.alert("Validation Error", "Please enter category name");
      return;
    }

    const payload = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || categoryName.trim(),
    };

    if (editingCategory) {
      updateCategory(
        {
          tenantId: currentBusiness.id,
          categoryId: editingCategory.id,
          category: payload,
        },
        {
          onSuccess: () => {
            resetAndCloseModal();
          },
          onError: (error) => {
            Alert.alert("Error", error.message || "Failed to update category");
          },
        },
      );
      return;
    }

    createCategory(
      {
        tenantId: currentBusiness.id,
        category: payload,
      },
      {
        onSuccess: () => {
          resetAndCloseModal();
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to create category");
        },
      },
    );
  };

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
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={BrandColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={BrandColors.primary} />
          </View>
        ) : null}

        {!isLoading && categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        ) : null}

        {categories.map((cat) => (
          <View key={cat.id} style={styles.card}>
            <View style={styles.emojiContainer}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={BrandColors.primary}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{cat.name}</Text>
              <Text style={styles.cardSubtitle}>{cat.description || "-"}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(cat)}
            >
              <Ionicons name="pencil" size={20} color={BrandColors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Edit Category" : "Add Category"}
              </Text>
              <TouchableOpacity onPress={resetAndCloseModal}>
                <Ionicons
                  name="close"
                  size={24}
                  color={BrandColors.gray[600]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Name</Text>
                <TextInput
                  style={styles.input}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="e.g. Desserts"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={categoryDescription}
                  onChangeText={setCategoryDescription}
                  placeholder="e.g. Food"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCategory}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
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
  addButton: {
    padding: Spacing.xs,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  emptyContainer: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: BrandColors.gray[500],
    fontSize: FontSizes.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  emojiText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  cardSubtitle: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
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
  formContainer: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.gray[700],
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSizes.md,
  },
  saveButton: {
    backgroundColor: BrandColors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: BrandColors.white,
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
});
