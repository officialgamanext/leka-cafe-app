import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  TenantUser,
  useAddTenantUser,
  useApiTenantUsers,
  useDeleteTenantUser,
} from "@/hooks/use-api-tenants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StaffScreen() {
  const insets = useSafeAreaInsets();
  const { currentBusiness } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<TenantUser | null>(null);

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const { mutate: addTenantUser, isPending: isAddingTenantUser } = useAddTenantUser();
  const { mutate: deleteTenantUser, isPending: isDeletingTenantUser } = useDeleteTenantUser();
  const { data: tenantUsers, isLoading: isTenantUsersLoading } = useApiTenantUsers({
    tenantId: currentBusiness?.id,
    enabled: !!currentBusiness?.id,
  });
  const countryCode = "+91"; // Assuming India for now, can be made dynamic later

  const handleOpenDeleteModal = (staff: TenantUser) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedStaff(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteStaff = () => {
    if (!currentBusiness?.id || !selectedStaff?.userId) {
      Alert.alert("Error", "Unable to delete staff member");
      return;
    }

    deleteTenantUser(
      {
        tenantId: currentBusiness.id,
        userId: selectedStaff.userId,
      },
      {
        onSuccess: () => {
          handleCloseDeleteModal();
          Alert.alert("Success", "Staff removed successfully");
        },
        onError: () => {
          Alert.alert("Error", "Failed to remove staff");
        },
      }
    );
  };

  const handleAddStaff = () => {
    if (!newName.trim() || !newMobile.trim()) {
      Alert.alert("Error", "Please fill name and mobile number");
      return;
    }
    if (newMobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    if (!currentBusiness?.id) {
      Alert.alert("Error", "No business selected");
      return;
    }

    addTenantUser({
      tenantId: currentBusiness.id,
      payload: {
        fullName: newName,
        phone: `${countryCode}${newMobile}`,
        role: "staff",
      },
    }, {
      onSuccess: () => {
        setNewName("");
        setNewMobile("");
        setShowModal(false);
        Alert.alert("Success", "Staff added successfully");
      },
      onError: () => {
        Alert.alert("Error", "Failed to add staff");
      },
    });
  };

  const renderStaffItem = ({ item }: { item: TenantUser }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffIcon}>
        <Ionicons name="person" size={24} color={BrandColors.primary} />
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.fullName}</Text>
        <Text style={styles.staffMobile}>{item.phone}</Text>
      </View>
      <View style={styles.staffBadge}>
        <Text style={styles.staffBadgeText}>{item.role}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleOpenDeleteModal(item)}
        disabled={isDeletingTenantUser}
      >
        <Ionicons name="trash-outline" size={18} color={BrandColors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Team Management</Text>
          <Text style={styles.headerSubtitle}>Manage your cafe staff</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={BrandColors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tenantUsers?.users || []}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isTenantUsersLoading ? 
          <ActivityIndicator size="large" color={BrandColors.primary} /> : 
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={BrandColors.gray[200]}
            />
            <Text style={styles.emptyText}>No team members yet</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Team Member</Text>
                <Text style={styles.modalSubtitle}>Enter their professional details</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={BrandColors.gray[900]} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalBody}
            >
              <View style={styles.fieldSection}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Siva Krishna"
                  placeholderTextColor={BrandColors.gray[400]}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.fieldSection}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000 00000"
                  placeholderTextColor={BrandColors.gray[400]}
                  value={newMobile}
                  onChangeText={setNewMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddStaff}
                disabled={isAddingTenantUser}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>{isAddingTenantUser ? "Adding..." : "Add to Team"}</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Remove Team Member?</Text>
            <Text style={styles.confirmMessage}>
              {`This will remove ${selectedStaff?.fullName || "this team member"} from your tenant.`}
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseDeleteModal}
                disabled={isDeletingTenantUser}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleConfirmDeleteStaff}
                disabled={isDeletingTenantUser}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {isDeletingTenantUser ? "Removing..." : "Remove"}
                </Text>
              </TouchableOpacity>
            </View>
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
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    fontWeight: "500",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  listContent: {
    padding: Spacing.xl,
  },
  staffCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: BrandColors.gray[50],
    ...Shadows.sm,
  },
  staffIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  staffMobile: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
    fontWeight: "500",
  },
  staffBadge: {
    backgroundColor: BrandColors.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.danger + "10",
  },
  staffBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BrandColors.gray[600],
    textTransform: "uppercase",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[300],
    marginTop: Spacing.md,
    fontWeight: "600",
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
  closeButton: {
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
  fieldSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: BrandColors.gray[400],
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: BrandColors.gray[50],
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
    fontWeight: "600",
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  saveButton: {
    backgroundColor: BrandColors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  saveButtonText: {
    color: BrandColors.white,
    fontWeight: "800",
    fontSize: FontSizes.lg,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  confirmModalContent: {
    width: "100%",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  confirmTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  confirmMessage: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    fontWeight: "500",
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.xl,
  },
  cancelButton: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: BrandColors.gray[700],
  },
  deleteConfirmButton: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: "800",
    color: BrandColors.white,
  },
});
