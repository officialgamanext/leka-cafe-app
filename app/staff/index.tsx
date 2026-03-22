import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Roles, Staff } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: "1",
      name: "Siva Krishna",
      mobile: "9876543210",
      role: Roles.STAFF,
      tenantId: currentBusiness?.id || "1",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");

  const handleAddStaff = () => {
    if (!newName.trim() || !newMobile.trim()) {
      Alert.alert("Error", "Please fill name and mobile number");
      return;
    }

    if (newMobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    const newStaff: Staff = {
      id: Date.now().toString(),
      name: newName,
      mobile: newMobile,
      role: Roles.STAFF,
      tenantId: currentBusiness?.id || "1",
      createdAt: new Date().toISOString(),
    };

    setStaffList((prev) => [...prev, newStaff]);
    setNewName("");
    setNewMobile("");
    setShowModal(false);
    Alert.alert("Success", "Staff added successfully");
  };

  const renderStaffItem = ({ item }: { item: Staff }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffIcon}>
        <Ionicons name="person" size={24} color={BrandColors.primary} />
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffMobile}>{item.mobile}</Text>
      </View>
      <View style={styles.staffRole}>
        <Text style={styles.staffRoleText}>Staff</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={24} color={BrandColors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={staffList}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={BrandColors.gray[300]}
            />
            <Text style={styles.emptyText}>No staff added yet</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Staff</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={BrandColors.gray[600]} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalBody}
            >
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter staff name"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile"
                value={newMobile}
                onChangeText={setNewMobile}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddStaff}
              >
                <Text style={styles.saveButtonText}>Save Staff</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
    justifyContent: "space-between",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    flex: 1,
    marginLeft: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: Spacing.lg,
  },
  staffCard: {
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
  staffIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  staffMobile: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    marginTop: 2,
  },
  staffRole: {
    backgroundColor: BrandColors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  staffRoleText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
    color: BrandColors.gray[600],
    textTransform: "uppercase",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: BrandColors.gray[400],
    marginTop: Spacing.md,
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
    minHeight: "50%",
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
  modalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.gray[700],
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: BrandColors.gray[50],
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
  },
  saveButton: {
    backgroundColor: BrandColors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: 40,
  },
  saveButtonText: {
    color: BrandColors.white,
    fontWeight: "700",
    fontSize: FontSizes.lg,
  },
});
