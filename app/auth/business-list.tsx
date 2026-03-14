import { SkeletonBusinessList } from "@/components/skeleton-business-card";
import {
  BorderRadius,
  BrandColors,
  FontSizes,
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
import { SafeAreaView } from "react-native-safe-area-context";

// Country options with flags
const COUNTRIES = [
  { label: "🇮🇳  India", value: "India" },
  { label: "🇦🇪  UAE", value: "UAE" },
  { label: "🇺🇸  United States", value: "US" },
];

export default function BusinessListScreen() {
  const {
    user,
    selectBusiness,
    getToken,
    isAuthenticated,
    token,
    getCurrentBusinessRole,
    setToken,
    setRefreshToken,

  } = useAuth();
  const {
    data: businessList,
    isLoading,
    error,
  } = useApiTenants({ enabled: isAuthenticated });
  const { mutate, isPending: isCreatePending } = useCreateApiTenant();

  // Modal state
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

  const handleOpenModal = () => {
    setCafeName("");
    setAddressLane1("");
    setAddressLane2("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("");
    setCountryDropdownOpen(false);
    setModalVisible(true);
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
        Alert.alert("Business Created Successfully !");
        // update new token and refresh token in auth context
        const apiResponse = data.data;
        if (apiResponse.accessToken && apiResponse.refreshToken) {
            setToken(apiResponse.accessToken);
            setRefreshToken(apiResponse.refreshToken);
        }
      },
      onError: () => {
        Alert.alert(
          "Failed Creating Business",
          "Failed to Create the Business, Please try again",
        );
        setModalVisible(false);
      },
    });
  };

  const getSubscriptionStatusInfo = (business: Business) => {
    const status: unknown = business.subscription?.status;
    const isSubscriptionActive =
      typeof status === "boolean"
        ? status
        : typeof status === "string"
          ? status.toLowerCase() === "true"
          : status instanceof Boolean
            ? status.valueOf()
            : false;

    if (!isSubscriptionActive) {
      return {
        label: "Inactive",
        color: BrandColors.danger,
        bgColor: BrandColors.danger + "15",
        textColor: BrandColors.danger,
        icon: "close-circle",
      };
    }

    const endDateValue = business.subscription?.endDate;
    if (endDateValue) {
      const endDate = new Date(endDateValue);
      if (!Number.isNaN(endDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (endDate < today) {
          return {
            label: "Expired",
            color: BrandColors.danger,
            bgColor: BrandColors.danger + "15",
            textColor: BrandColors.danger,
            icon: "alert-circle",
          };
        }

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        if (endDate < oneMonthFromNow) {
          return {
            label: "Expires Soon",
            color: BrandColors.warning,
            bgColor: BrandColors.warning + "15",
            textColor: BrandColors.warning,
            icon: "time",
          };
        }
      }
    }

    return {
      label: "Active",
      color: BrandColors.success,
      bgColor: BrandColors.success + "15",
      textColor: BrandColors.success,
      icon: "checkmark-circle",
    };
  };

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const subscriptionStatusInfo = getSubscriptionStatusInfo(item);

    return (
      <TouchableOpacity
        style={styles.businessCard}
        onPress={() => handleSelectBusiness(item)}
        activeOpacity={0.7}
      >
        <View style={styles.businessIcon}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.businessInfo}>
          <View style={styles.businessNameRow}>
            <Text style={styles.businessName}>{item.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: subscriptionStatusInfo.bgColor },
              ]}
            >
              <Ionicons
                name={subscriptionStatusInfo.icon as any}
                size={12}
                color={subscriptionStatusInfo.textColor}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: subscriptionStatusInfo.textColor },
                ]}
              >
                {subscriptionStatusInfo.label}
              </Text>
            </View>
          </View>
          <Text style={styles.businessAddress}>
            {item.address?.line1}, {item.address?.line2}, {item.address?.city},{" "}
            {item.address?.state} - {item.address?.postalCode},{" "}
            {item.address?.country}{" "}
          </Text>
          {item.contact?.phone && (
            <View style={styles.businessMeta}>
              <Ionicons
                name="call-outline"
                size={14}
                color={BrandColors.gray[500]}
              />
              <Text style={styles.businessPhone}>{item.contact?.phone}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={BrandColors.gray[400]}
        />
      </TouchableOpacity>
    );
  };

  const selectedCountryLabel = COUNTRIES.find(
    (c) => c.value === country,
  )?.label;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BrandColors.white}
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"} 👋</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={BrandColors.primary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Select Business</Text>
          <Text style={styles.subtitle}>Choose a cafe to manage</Text>
        </View>

        {/* Business List */}
        {isLoading && <SkeletonBusinessList />}
        {!isLoading && (
          <FlatList
            data={businessList?.data}
            keyExtractor={(item) => item.id}
            renderItem={renderBusinessItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Add Business Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={handleOpenModal}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={BrandColors.accent}
            />
            <Text style={styles.addButtonText}>Add New Business</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Add New Business Modal ─── */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          presentationStyle="fullScreen"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <SafeAreaView style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalKeyboard}
              >
                <View style={styles.modalContainer}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add New Business</Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={BrandColors.gray[700]}
                      />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.modalScroll}
                  >
                    {/* Cafe Name */}
                    <Text style={styles.inputLabel}>Cafe Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter cafe name"
                      placeholderTextColor={BrandColors.gray[400]}
                      value={cafeName}
                      onChangeText={setCafeName}
                      returnKeyType="next"
                    />

                    {/* Address Section */}
                    <View style={styles.sectionDivider}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={BrandColors.primary}
                      />
                      <Text style={styles.sectionTitle}>Address</Text>
                    </View>

                    <Text style={styles.inputLabel}>Address Lane 1</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Street address"
                      placeholderTextColor={BrandColors.gray[400]}
                      value={addressLane1}
                      onChangeText={setAddressLane1}
                      returnKeyType="next"
                    />

                    <View style={styles.optionalRow}>
                      <Text style={styles.inputLabel}>Address Lane 2</Text>
                      <Text style={styles.optionalTag}>Optional</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Apt, suite, floor, etc."
                      placeholderTextColor={BrandColors.gray[400]}
                      value={addressLane2}
                      onChangeText={setAddressLane2}
                      returnKeyType="next"
                    />

                    {/* City & State – side by side */}
                    <View style={styles.row}>
                      <View style={styles.halfField}>
                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="City"
                          placeholderTextColor={BrandColors.gray[400]}
                          value={city}
                          onChangeText={setCity}
                          returnKeyType="next"
                        />
                      </View>
                      <View style={styles.halfField}>
                        <Text style={styles.inputLabel}>State</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="State"
                          placeholderTextColor={BrandColors.gray[400]}
                          value={state}
                          onChangeText={setState}
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    {/* Zip & Country – side by side */}
                    <View style={styles.row}>
                      <View style={styles.halfField}>
                        <Text style={styles.inputLabel}>Zip Code</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Zip Code"
                          placeholderTextColor={BrandColors.gray[400]}
                          value={zipCode}
                          onChangeText={setZipCode}
                          keyboardType="number-pad"
                          returnKeyType="done"
                        />
                      </View>
                      <View style={styles.halfField}>
                        <Text style={styles.inputLabel}>Country</Text>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() =>
                            setCountryDropdownOpen(!countryDropdownOpen)
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dropdownButtonText,
                              !country && { color: BrandColors.gray[400] },
                            ]}
                          >
                            {selectedCountryLabel || "Select"}
                          </Text>
                          <Ionicons
                            name={
                              countryDropdownOpen
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={18}
                            color={BrandColors.gray[500]}
                          />
                        </TouchableOpacity>

                        {countryDropdownOpen && (
                          <View style={styles.dropdownList}>
                            {COUNTRIES.map((c) => (
                              <TouchableOpacity
                                key={c.value}
                                style={[
                                  styles.dropdownItem,
                                  country === c.value &&
                                    styles.dropdownItemActive,
                                ]}
                                onPress={() => {
                                  setCountry(c.value);
                                  setCountryDropdownOpen(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    country === c.value &&
                                      styles.dropdownItemTextActive,
                                  ]}
                                >
                                  {c.label}
                                </Text>
                                {country === c.value && (
                                  <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color={BrandColors.primary}
                                  />
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        (!cafeName ||
                          !addressLane1 ||
                          !city ||
                          !state ||
                          !zipCode ||
                          !country) &&
                          styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveDetails}
                      disabled={
                        !cafeName ||
                        !addressLane1 ||
                        !city ||
                        !state ||
                        !zipCode ||
                        !country
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={BrandColors.white}
                      />
                      <Text style={styles.saveButtonText}>Save Details</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: BrandColors.white,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: BrandColors.white,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  listContent: {
    padding: Spacing.lg,
  },
  businessCard: {
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
  businessIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  businessInfo: {
    flex: 1,
  },
  businessNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flexWrap: "wrap",
  },
  businessName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
  },
  businessAddress: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    marginBottom: Spacing.xs,
  },
  businessMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  businessPhone: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
  },
  bottomContainer: {
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: BrandColors.accent,
    borderStyle: "dashed",
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.accent,
  },

  /* ─── Modal Styles ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  modalKeyboard: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  modalScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  /* ─── Form Styles ─── */
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.gray[700],
    marginBottom: Spacing.xs,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
    backgroundColor: BrandColors.gray[50],
    marginBottom: Spacing.md,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  optionalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  optionalTag: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[400],
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },

  /* ─── Country Dropdown ─── */
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: BrandColors.gray[50],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  dropdownButtonText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[900],
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: BrandColors.gray[200],
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.white,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  dropdownItemActive: {
    backgroundColor: BrandColors.primary + "10",
  },
  dropdownItemText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[800],
  },
  dropdownItemTextActive: {
    color: BrandColors.primary,
    fontWeight: "600",
  },

  /* ─── Save Button ─── */
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.white,
  },
});
