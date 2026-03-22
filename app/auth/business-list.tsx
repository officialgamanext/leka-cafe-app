import { SkeletonBusinessList } from "@/components/skeleton-business-card";
import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useApiTenants, useCreateApiTenant } from "@/hooks/use-api-tenants";
import { Business, Roles } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const COUNTRIES = [
  { label: "🇮🇳  India", value: "India" },
  { label: "🇦🇪  UAE", value: "UAE" },
  { label: "🇺🇸  United States", value: "US" },
];

export default function BusinessListScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    selectBusiness,
    isAuthenticated,
    getCurrentBusinessRole,
    setToken,
    setRefreshToken,
  } = useAuth();
  const {
    data: businessList,
    isLoading,
  } = useApiTenants({ enabled: isAuthenticated });
  const { mutate, isPending: isCreatePending } = useCreateApiTenant();

  const [modalVisible, setModalVisible] = useState(false);
  const [cafeName, setCafeName] = useState("");
  const [addressLane1, setAddressLane1] = useState("");
  const [addressLane2, setAddressLane2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const handleSelectBusiness = (business: Business) => {
    selectBusiness(business);
    if (business.subscription?.status === false) {
      router.push("/subscriptions");
      return;
    }
    if (getCurrentBusinessRole() === Roles.OWNER) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(tabs)/billing");
    }
  };

  const handleSaveDetails = async () => {
    const newBusiness = {
      name: cafeName,
      address: {
        line1: addressLane1,
        line2: addressLane2,
        city,
        state,
        postalCode: zipCode,
        country,
      },
    };
    mutate(newBusiness, {
      onSuccess: (data) => {
        setModalVisible(false);
        const apiResponse = data.data;
        if (apiResponse.accessToken && apiResponse.refreshToken) {
            setToken(apiResponse.accessToken);
            setRefreshToken(apiResponse.refreshToken);
        }
      },
      onError: () => {
        Alert.alert("Error", "Failed to create business. Please try again.");
      },
    });
  };

  const getSubscriptionStatusInfo = (business: Business) => {
    const status: unknown = business.subscription?.status;
    const isSubscriptionActive = !!status;

    if (!isSubscriptionActive) {
      return { label: "Inactive", color: BrandColors.danger, icon: "close-circle" };
    }

    const endDateValue = business.subscription?.endDate;
    if (endDateValue) {
      const endDate = new Date(endDateValue);
      if (!Number.isNaN(endDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (endDate < today) {
          return { label: "Expired", color: BrandColors.danger, icon: "alert-circle" };
        }
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        if (endDate < oneMonthFromNow) {
          return { label: "Expiring", color: BrandColors.warning, icon: "time" };
        }
      }
    }
    return { label: "Active", color: BrandColors.success, icon: "checkmark-circle" };
  };

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const status = getSubscriptionStatusInfo(item);

    return (
      <TouchableOpacity
        style={styles.businessCard}
        onPress={() => handleSelectBusiness(item)}
        activeOpacity={0.8}
      >
        <View style={styles.businessIcon}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.businessInfo}>
          <View style={styles.businessNameRow}>
            <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + "10" }]}>
              <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.businessAddress} numberOfLines={2}>
            {item.address?.city}, {item.address?.state}
          </Text>
          <View style={styles.businessFooter}>
             <Ionicons name="location" size={12} color={BrandColors.gray[400]} />
             <Text style={styles.businessZip}>{item.address?.postalCode}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={BrandColors.gray[300]} />
      </TouchableOpacity>
    );
  };

  const selectedCountryLabel = COUNTRIES.find(c => c.value === country)?.label;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.name || "Partner"}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person" size={20} color={BrandColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Your Businesses</Text>
          <Text style={styles.mainSubtitle}>Select a business to start managing</Text>
        </View>

        {isLoading ? (
          <SkeletonBusinessList />
        ) : (
          <FlatList
            data={businessList?.data}
            keyExtractor={(item) => item.id}
            renderItem={renderBusinessItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="cafe-outline" size={64} color={BrandColors.gray[200]} />
                <Text style={styles.emptyText}>No businesses found</Text>
              </View>
            }
          />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <TouchableOpacity 
          style={styles.addNewButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={BrandColors.white} />
          <Text style={styles.addNewButtonText}>Add New Business</Text>
        </TouchableOpacity>
      </View>

      {/* Add Business Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={BrandColors.gray[900]} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Business</Text>
              <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Business Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Leka Premium Cafe"
                  value={cafeName}
                  onChangeText={setCafeName}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Street Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Line 1"
                  value={addressLane1}
                  onChangeText={setAddressLane1}
                />
                <TextInput
                  style={[styles.input, { marginTop: Spacing.sm }]}
                  placeholder="Line 2 (Optional)"
                  value={addressLane2}
                  onChangeText={setAddressLane2}
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000 000"
                    keyboardType="number-pad"
                    value={zipCode}
                    onChangeText={setZipCode}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  >
                    <Text style={[styles.dropdownText, !country && { color: BrandColors.gray[400] }]}>
                      {selectedCountryLabel || "Select"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={BrandColors.gray[400]} />
                  </TouchableOpacity>
                  
                  {countryDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {COUNTRIES.map(c => (
                        <TouchableOpacity 
                          key={c.value} 
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCountry(c.value);
                            setCountryDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{c.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, isCreatePending && { opacity: 0.7 }]}
                onPress={handleSaveDetails}
                disabled={isCreatePending}
              >
                {isCreatePending ? (
                  <ActivityIndicator color={BrandColors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Create Business</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  header: {
    backgroundColor: BrandColors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    fontWeight: "500",
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
  },
  main: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  titleSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  mainTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: "800",
    color: BrandColors.gray[900],
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 100,
  },
  businessCard: {
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
  businessIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  businessInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  businessNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  businessName: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  businessAddress: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    lineHeight: 16,
  },
  businessFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  businessZip: {
    fontSize: 10,
    color: BrandColors.gray[400],
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[50],
  },
  addNewButton: {
    backgroundColor: BrandColors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.md,
  },
  addNewButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[300],
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    color: BrandColors.gray[900],
  },
  modalScroll: {
    padding: Spacing.xl,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: BrandColors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
    fontWeight: "600",
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dropdown: {
    height: 52,
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  dropdownText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
    fontWeight: "600",
  },
  dropdownMenu: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
    zIndex: 100,
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
    overflow: "hidden",
  },
  dropdownItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[50],
  },
  dropdownItemText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[700],
    fontWeight: "600",
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
    fontSize: FontSizes.lg,
    fontWeight: "800",
  },
});
