import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
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
      <View style={styles.staffBadge}>
        <Text style={styles.staffBadgeText}>Staff</Text>
      </View>
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
        data={staffList}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
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
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Add to Team</Text>
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
});
