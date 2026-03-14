import { SkeletonBusinessList } from "@/components/skeleton-business-card";
import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useUpdateApiTenant } from "@/hooks/use-api-tenants";
import { requestPrinterPermissions } from "@/hooks/use-permissions";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
import {
  BLEPrinter,
  IBLEPrinter,
} from "react-native-thermal-receipt-printer-image-qr";

const COUNTRIES = [
  { label: "🇮🇳  India", value: "IN" },
  { label: "🇦🇪  UAE", value: "UAE" },
  { label: "🇺🇸  United States", value: "US" },
];

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}: MenuItemProps) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? BrandColors.danger : BrandColors.primary}
      />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
        {label}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={BrandColors.gray[400]}
      />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const {
    user,
    currentBusiness,
    logout,
    selectBusiness,
    getCurrentBusinessRole,
  } = useAuth();
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [printers, setPrinters] = useState<IBLEPrinter[]>([]);
  const [taxPercentage, setTaxPercentage] = useState<string>(
    currentBusiness?.defaultTaxRate?.toString() || "0" || "0",
  );
  const [tempTaxPercentage, setTempTaxPercentage] = useState<string>(
    currentBusiness?.defaultTaxRate?.toString() || "0" || "0",
  );
  const [connectedPrinter, setConnectedPrinter] = useState<IBLEPrinter | null>(
    null,
  );
  const [connectedMacAddress, setConnectedMacAddress] = useState<string | null>(
    null,
  );
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editRole, setEditRole] = useState("-");
  const [editMobile, setEditMobile] = useState(user?.mobile || "");
  const [editGst, setEditGst] = useState(
    currentBusiness?.leagalInfo?.gstNumber || "",
  );
  const [editCafeName, setEditCafeName] = useState(
    currentBusiness?.name || "CafeBill",
  );
  const [editAddressLine1, setEditAddressLine1] = useState(
    currentBusiness?.address?.line1 || "",
  );
  const [editAddressLine2, setEditAddressLine2] = useState(
    currentBusiness?.address?.line2 || "",
  );
  const [editCity, setEditCity] = useState(
    currentBusiness?.address?.city || "",
  );
  const [editState, setEditState] = useState(
    currentBusiness?.address?.state || "",
  );
  const [editPostalCode, setEditPostalCode] = useState(
    currentBusiness?.address?.postalCode || "",
  );
  const [editCountry, setEditCountry] = useState(
    currentBusiness?.address?.country || "",
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const { mutate: updateTenant, isPending: isUpdatingTenant } =
    useUpdateApiTenant();

  useEffect(() => {
    if (showPrinterModal) {
      discoverPrinters();
    }
  }, [showPrinterModal]);

  useEffect(() => {
    const role = getCurrentBusinessRole();
    setEditRole(role ? role.charAt(0).toUpperCase() + role.slice(1) : "-");
    setEditGst(currentBusiness?.leagalInfo?.gstNumber || "");
    setEditCafeName(currentBusiness?.name || "CafeBill");
    setEditAddressLine1(currentBusiness?.address?.line1 || "");
    setEditAddressLine2(currentBusiness?.address?.line2 || "");
    setEditCity(currentBusiness?.address?.city || "");
    setEditState(currentBusiness?.address?.state || "");
    setEditPostalCode(currentBusiness?.address?.postalCode || "");
    setEditCountry(currentBusiness?.address?.country || "");
  }, [currentBusiness, getCurrentBusinessRole]);

  const discoverPrinters = async () => {
    try {
      setIsDiscovering(true);
      console.log("Initializing BLEPrinter...");
      await BLEPrinter.init();
      console.log("Getting device list...");
      const deviceList = await BLEPrinter.getDeviceList();
      console.log("Devices found count:", deviceList?.length);
      if (deviceList && deviceList.length > 0) {
        console.log(
          "First device structure:",
          JSON.stringify(deviceList[0], null, 2),
        );
        console.log("First device keys:", Object.keys(deviceList[0]));
      }
      setPrinters(deviceList || []);
    } catch (error) {
      console.error("Printer discovery error:", error);
      Alert.alert("Error", "Failed to discover printers: " + String(error));
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  const handleConnectPrinter = async (printer: IBLEPrinter) => {
    try {
      console.log("Connecting to printer:", printer);
      const macAddress = printer.inner_mac_address?.trim() || "";
      console.log("MAC Address:", macAddress);
      Alert.alert("Connecting", "Connecting to " + printer.device_name + "...");

      await BLEPrinter.connectPrinter(macAddress);
      console.log("Connected successfully");

      setConnectedPrinter(printer);
      setConnectedMacAddress(macAddress);
      Alert.alert("Success", "Connected to " + printer.device_name);
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Error", "Failed to connect: " + String(error));
    }
  };

  const handleTestPrint = async (printer: IBLEPrinter) => {
    try {
      console.log("Test printing on printer:", printer);
      Alert.alert("Printing", "Sending test print...");

      await BLEPrinter.connectPrinter(printer.inner_mac_address);
      console.log("Connected successfully");

      await BLEPrinter.printText("<C>Test Print</C>\n");
      await BLEPrinter.printText("--------------------------------\n");
      await BLEPrinter.printText("Printer is working!\n");
      await BLEPrinter.printText("--------------------------------\n\n\n");

      Alert.alert("Success", "Test print sent successfully!");
      console.log("Print completed");
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert("Error", "Failed to print: " + String(error));
    }
  };

  const handleSwitchBusiness = () => {
    router.push("/auth/business-list");
  };

  const handleOpenEditBusinessModal = () => {
    setEditGst(currentBusiness?.leagalInfo?.gstNumber || "");
    setEditCafeName(currentBusiness?.name || "CafeBill");
    setEditAddressLine1(currentBusiness?.address?.line1 || "");
    setEditAddressLine2(currentBusiness?.address?.line2 || "");
    setEditCity(currentBusiness?.address?.city || "");
    setEditState(currentBusiness?.address?.state || "");
    setEditPostalCode(currentBusiness?.address?.postalCode || "");
    setEditCountry(currentBusiness?.address?.country || "");
    setCountryDropdownOpen(false);
    setShowEditProfileModal(true);
  };

  const handleSaveBusinessDetails = () => {
    if (!currentBusiness?.id) {
      Alert.alert("Business not selected", "Please select a business first.");
      return;
    }

    const payload = {
      name: editCafeName.trim(),
      address: {
        line1: editAddressLine1.trim(),
        line2: editAddressLine2.trim() || undefined,
        city: editCity.trim(),
        state: editState.trim(),
        postalCode: editPostalCode.trim(),
        country: editCountry.trim(),
      },
      logoUrl: currentBusiness.logo || "/logo.png",
      defaultTaxRate: 0.18,
      leagalInfo: {
        gstNumber: editGst.trim() || undefined,
      },
    };

    updateTenant(
      { tenantId: currentBusiness.id, payload },
      {
        onSuccess: () => {
          selectBusiness({
            ...currentBusiness,
            name: payload.name,
            address: payload.address,
            leagalInfo: {
              ...currentBusiness.leagalInfo,
              gstNumber: payload.leagalInfo.gstNumber,
            },
          });
          setShowEditProfileModal(false);
          Alert.alert("Success", "Business details updated successfully");
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to update business");
        },
      },
    );
  };

  const handleSaveTaxPercentage = () => {
    if (!currentBusiness?.id) {
      Alert.alert("Business not selected", "Please select a business first.");
      return;
    }

    const taxValue = parseFloat(tempTaxPercentage) || 0;

    if (taxValue < 0 || taxValue > 100) {
      Alert.alert("Invalid Tax", "Tax percentage must be between 0 and 100");
      return;
    }

    const payload = {
      name: currentBusiness.name,
      address: currentBusiness.address,
      logoUrl: currentBusiness.logo || "/logo.png",
      defaultTaxRate: taxValue,
      leagalInfo: currentBusiness.leagalInfo,
    };

    updateTenant(
      { tenantId: currentBusiness.id, payload },
      {
        onSuccess: () => {
          selectBusiness({
            ...currentBusiness,
            defaultTaxRate: taxValue,
          });
          setTaxPercentage(tempTaxPercentage);
          setShowTaxModal(false);
          Alert.alert("Success", "Tax percentage updated successfully");
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to update tax");
        },
      },
    );
  };

  const handlePrinterSetup = async () => {
    try {
      // Request permissions before opening printer modal
      const permissionsGranted = await requestPrinterPermissions();

      if (permissionsGranted) {
        setShowPrinterModal(true);
      }
    } catch (error) {
      console.error("Error requesting printer permissions:", error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
    }
  };

  const getCafeAddress = () => {
    if (!currentBusiness) return "Your Cafe Address";
    const { address } = currentBusiness;
    return `${address?.line1 || ""}, ${address?.line2 || ""}, ${address?.city || ""}, ${address?.state || ""} - ${address?.postalCode || ""}`;
  };

  const renderPrinter = ({ item }: { item: IBLEPrinter }) => {
    // Extract device name from the printer object
    const printerName = (item as any).device_name || "Unknown Printer";
    const macAddress = item.inner_mac_address;
    const isConnected = connectedPrinter?.inner_mac_address === macAddress;

    return (
      <View style={[styles.itemCard, isConnected && styles.itemCardConnected]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{printerName}</Text>
          <Text style={styles.itemSubInfo}>{macAddress}</Text>
          {isConnected && (
            <Text style={styles.connectedBadge}>✓ Connected</Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[
              styles.itemPrimaryButton,
              isConnected && styles.itemPrimaryButtonConnected,
            ]}
            onPress={() =>
              isConnected ? handleTestPrint(item) : handleConnectPrinter(item)
            }
          >
            <Ionicons
              name={isConnected ? "print" : "link"}
              size={18}
              color={BrandColors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={BrandColors.gray[700]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Card */}
        <TouchableOpacity
          style={styles.businessCard}
          onPress={handleOpenEditBusinessModal}
          activeOpacity={0.7}
        >
          <View style={styles.businessLogo}>
            <Ionicons name="cafe" size={40} color={BrandColors.primary} />
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>
              {currentBusiness?.name || "CafeBill"}
            </Text>
            <Text style={styles.businessAddress}>{getCafeAddress()}</Text>
          </View>
          <View style={styles.editBusinessButton}>
            <Ionicons name="pencil" size={18} color={BrandColors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <MenuItem
              icon="business-outline"
              label="Businesses"
              subtitle="Manage your businesses"
              onPress={handleSwitchBusiness}
            />
            <MenuItem
              icon="grid-outline"
              label="Categories"
              subtitle="Manage your categories"
              onPress={() => router.push("/categories")}
            />
            <MenuItem
              icon="person-outline"
              label="Role"
              subtitle={editRole}
              onPress={() => {}}
              showArrow={false}
            />
            <MenuItem
              icon="call-outline"
              label="Mobile number"
              subtitle={editMobile || "+91 XXXXXXXXXX"}
              onPress={() => {}}
              showArrow={false}
            />
            <MenuItem
              icon="document-text-outline"
              label="GST"
              subtitle={editGst || "Not configured"}
              onPress={handleOpenEditBusinessModal}
            />
            <MenuItem
              icon="card-outline"
              label="Subscriptions"
              subtitle="View and manage plans"
              onPress={() => router.push("/subscriptions")}
            />
            <MenuItem
              icon="pricetag-outline"
              label="Tax"
              subtitle={`${taxPercentage}% tax configured`}
              onPress={() => {
                setTempTaxPercentage(taxPercentage);
                setShowTaxModal(true);
              }}
            />
            <MenuItem
              icon="print-outline"
              label="Printer setup"
              subtitle="Configure receipt printer"
              onPress={handlePrinterSetup}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <MenuItem
              icon="help-circle-outline"
              label="Help and support"
              onPress={() => router.push("/help")}
            />
            <MenuItem
              icon="star-outline"
              label="Rate the App"
              onPress={() =>
                Linking.openURL("market://details?id=com.leka.billing").catch(
                  () =>
                    Linking.openURL(
                      "https://play.google.com/store/apps/details?id=com.leka.billing",
                    ),
                )
              }
            />
            <MenuItem
              icon="information-circle-outline"
              label="About"
              onPress={() => router.push("/about")}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => router.push("/privacy-policy")}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms and conditions"
              onPress={() => router.push("/terms-conditions")}
            />
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionContent}>
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              showArrow={false}
              danger
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for Cafes</Text>
          <Text style={styles.versionText}>CafeBill v1.0.0</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.businessModalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.businessModalKeyboard}
            >
              <View style={styles.businessModalContainer}>
                <View style={styles.businessModalHeader}>
                  <Text style={styles.businessModalTitle}>Edit Business</Text>
                  <TouchableOpacity
                    onPress={() => setShowEditProfileModal(false)}
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
                  contentContainerStyle={styles.businessModalScroll}
                >
                  <Text style={styles.inputLabel}>Cafe Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editCafeName}
                    onChangeText={setEditCafeName}
                    placeholder="Enter cafe name"
                    placeholderTextColor={BrandColors.gray[400]}
                    returnKeyType="next"
                  />

                  <View style={styles.sectionDivider}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={BrandColors.primary}
                    />
                    <Text style={styles.formSectionTitle}>Address</Text>
                  </View>

                  <Text style={styles.inputLabel}>Address Lane 1</Text>
                  <TextInput
                    style={styles.input}
                    value={editAddressLine1}
                    onChangeText={setEditAddressLine1}
                    placeholder="Street address"
                    placeholderTextColor={BrandColors.gray[400]}
                    returnKeyType="next"
                  />

                  <View style={styles.optionalRow}>
                    <Text style={styles.inputLabel}>Address Lane 2</Text>
                    <Text style={styles.optionalTag}>Optional</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={editAddressLine2}
                    onChangeText={setEditAddressLine2}
                    placeholder="Apt, suite, floor, etc."
                    placeholderTextColor={BrandColors.gray[400]}
                    returnKeyType="next"
                  />

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.inputLabel}>City</Text>
                      <TextInput
                        style={styles.input}
                        value={editCity}
                        onChangeText={setEditCity}
                        placeholder="City"
                        placeholderTextColor={BrandColors.gray[400]}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.halfField}>
                      <Text style={styles.inputLabel}>State</Text>
                      <TextInput
                        style={styles.input}
                        value={editState}
                        onChangeText={setEditState}
                        placeholder="State"
                        placeholderTextColor={BrandColors.gray[400]}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.inputLabel}>Zip Code</Text>
                      <TextInput
                        style={styles.input}
                        value={editPostalCode}
                        onChangeText={setEditPostalCode}
                        placeholder="Zip Code"
                        placeholderTextColor={BrandColors.gray[400]}
                        keyboardType="number-pad"
                        returnKeyType="next"
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
                            !editCountry && { color: BrandColors.gray[400] },
                          ]}
                        >
                          {COUNTRIES.find((c) => c.value === editCountry)
                            ?.label || "Select"}
                        </Text>
                        <Ionicons
                          name={
                            countryDropdownOpen ? "chevron-up" : "chevron-down"
                          }
                          size={18}
                          color={BrandColors.gray[500]}
                        />
                      </TouchableOpacity>

                      {countryDropdownOpen && (
                        <View style={styles.dropdownList}>
                          {COUNTRIES.map((country) => (
                            <TouchableOpacity
                              key={country.value}
                              style={[
                                styles.dropdownItem,
                                editCountry === country.value &&
                                  styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setEditCountry(country.value);
                                setCountryDropdownOpen(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  editCountry === country.value &&
                                    styles.dropdownItemTextActive,
                                ]}
                              >
                                {country.label}
                              </Text>
                              {editCountry === country.value && (
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

                  <View style={styles.sectionDivider}>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={BrandColors.primary}
                    />
                    <Text style={styles.formSectionTitle}>Legal</Text>
                  </View>

                  <Text style={styles.inputLabel}>GST Number</Text>
                  <TextInput
                    style={styles.input}
                    value={editGst}
                    onChangeText={setEditGst}
                    placeholder="Enter GST number"
                    autoCapitalize="characters"
                    placeholderTextColor={BrandColors.gray[400]}
                    returnKeyType="done"
                  />

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!editCafeName ||
                        !editAddressLine1 ||
                        !editCity ||
                        !editState ||
                        !editPostalCode ||
                        !editCountry ||
                        isUpdatingTenant) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveBusinessDetails}
                    disabled={
                      !editCafeName ||
                      !editAddressLine1 ||
                      !editCity ||
                      !editState ||
                      !editPostalCode ||
                      !editCountry ||
                      isUpdatingTenant
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={BrandColors.white}
                    />
                    <Text style={styles.saveButtonText}>
                      {isUpdatingTenant ? "Saving..." : "Save Details"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showPrinterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrinterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Printers</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  onPress={discoverPrinters}
                  style={styles.refreshButton}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={BrandColors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPrinterModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={BrandColors.gray[600]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalBody}>
              {isDiscovering && <SkeletonBusinessList />}
              {/* Display the Connected and Available printers */}
              {!isDiscovering && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Connected Printers Section */}
                  {connectedPrinter && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>
                        ✓ Connected Printer
                      </Text>
                      {renderPrinter({ item: connectedPrinter })}
                    </View>
                  )}

                  {/* Available Printers Section */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      Available Printers
                    </Text>
                    {printers.filter((p) => {
                      const macAddress = p.inner_mac_address?.trim() || "";
                      return (
                        !connectedMacAddress ||
                        macAddress !== connectedMacAddress
                      );
                    }).length > 0 ? (
                      printers
                        .filter((p) => {
                          const macAddress = p.inner_mac_address?.trim() || "";
                          return (
                            !connectedMacAddress ||
                            macAddress !== connectedMacAddress
                          );
                        })
                        .map((printer) => (
                          <View key={printer.inner_mac_address}>
                            {renderPrinter({ item: printer })}
                          </View>
                        ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Ionicons
                          name="cafe-outline"
                          size={64}
                          color={BrandColors.gray[300]}
                        />
                        <Text style={styles.emptyText}>
                          No other printers available
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => setShowPrinterModal(false)}
              >
                <Text style={styles.modalPrimaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tax Percentage Modal */}
      <Modal
        visible={showTaxModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaxModal(false)}
      >
        <View style={styles.taxModalOverlay}>
          <View style={styles.taxModalContent}>
            <View style={styles.taxModalHeader}>
              <Text style={styles.taxModalTitle}>Set Tax Percentage</Text>
              <TouchableOpacity
                onPress={() => setShowTaxModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={BrandColors.gray[700]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.taxModalBody}>
              <Text style={styles.taxInputLabel}>Tax Percentage (%)</Text>
              <View style={styles.taxInputContainer}>
                <TextInput
                  style={styles.taxInput}
                  value={tempTaxPercentage}
                  onChangeText={setTempTaxPercentage}
                  placeholder="0"
                  placeholderTextColor={BrandColors.gray[400]}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.taxInputSuffix}>%</Text>
              </View>
              <Text style={styles.taxInputHint}>
                Enter a value between 0 and 100
              </Text>
            </View>

            <View style={styles.taxModalActions}>
              <TouchableOpacity
                style={styles.taxModalCancelButton}
                onPress={() => setShowTaxModal(false)}
              >
                <Text style={styles.taxModalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.taxModalSaveButton}
                onPress={handleSaveTaxPercentage}
                disabled={isUpdatingTenant}
              >
                <Text style={styles.taxModalSaveButtonText}>
                  {isUpdatingTenant ? "Saving..." : "Save"}
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
  },
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  businessLogo: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  businessInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  businessName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  businessAddress: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    marginTop: Spacing.xs,
  },
  editBusinessButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: BrandColors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[100],
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuIconDanger: {
    backgroundColor: BrandColors.danger + "15",
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  menuLabelDanger: {
    color: BrandColors.danger,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  lastSection: {
    marginBottom: 0,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
  },
  versionText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[400],
    marginTop: Spacing.xs,
  },
  businessModalOverlay: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  businessModalKeyboard: {
    flex: 1,
  },
  businessModalContainer: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  businessModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  businessModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  businessModalScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
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
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  refreshButton: {
    padding: Spacing.sm,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray[200],
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: BrandColors.gray[300],
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[700],
  },
  modalPrimaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
  },
  modalPrimaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.white,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
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
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  itemPrimaryButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.gray[900],
  },
  itemSubInfo: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    marginTop: 2,
  },
  itemCardConnected: {
    backgroundColor: BrandColors.primary + "10",
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  itemPrimaryButtonConnected: {
    backgroundColor: BrandColors.primary + "30",
  },
  connectedBadge: {
    fontSize: FontSizes.sm,
    color: BrandColors.primary,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  modalSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
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
  formSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
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
  input: {
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
  /* ─── Tax Modal Styles ─── */
  taxModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  taxModalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    maxHeight: "60%",
  },
  taxModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  taxModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  taxModalBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  taxInputLabel: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
  },
  taxInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  taxInput: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.lg,
    color: BrandColors.gray[900],
    backgroundColor: BrandColors.gray[50],
  },
  taxInputSuffix: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: BrandColors.primary,
    marginLeft: Spacing.sm,
  },
  taxInputHint: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
  },
  taxModalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  taxModalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  taxModalCancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[700],
  },
  taxModalSaveButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  taxModalSaveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.white,
  },
});
