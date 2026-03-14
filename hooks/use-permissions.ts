import { Alert, Linking, Platform } from "react-native";

/**
 * Show permission dialog one by one
 */
const showPermissionDialog = (
  permission: string,
  description: string,
): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      permission,
      description,
      [
        {
          text: "DENY",
          onPress: () => resolve(false),
          style: "cancel",
        },
        {
          text: "ALLOW",
          onPress: () => resolve(true),
          style: "default",
        },
      ],
      { cancelable: false },
    );
  });
};

/**
 * Request printer setup permissions one by one
 * Shows alerts for each required permission with ALLOW/DENY buttons
 */
export const requestPrinterPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "android") {
      // Required permissions for Android Bluetooth printer setup
      const permissions = [
        {
          name: "Bluetooth Scanner",
          description: "Allow access to scan for Bluetooth devices?",
        },
        {
          name: "Bluetooth Connection",
          description: "Allow connection to Bluetooth devices?",
        },
        {
          name: "Fine Location",
          description:
            "Allow precise location access? (Required for Bluetooth scanning)",
        },
        {
          name: "Coarse Location",
          description: "Allow approximate location access?",
        },
      ];

      let allGranted = true;
      for (const permission of permissions) {
        const granted = await showPermissionDialog(
          permission.name,
          permission.description,
        );
        if (!granted) {
          allGranted = false;
        }
      }

      if (allGranted) {
        Alert.alert(
          "Success",
          "All permissions granted! You can now set up a Bluetooth printer.",
          [{ text: "OK", style: "default" }],
        );
      } else {
        Alert.alert(
          "Permissions Denied",
          "Some permissions were denied. You can enable them later in app settings.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ],
        );
      }

      return allGranted;
    } else if (Platform.OS === "ios") {
      // For iOS, ask for Bluetooth permission
      const granted = await showPermissionDialog(
        "Bluetooth Permission",
        "Allow access to Bluetooth devices for printer setup?",
      );

      if (granted) {
        Alert.alert(
          "Success",
          "Bluetooth permission granted! You can now connect to a printer.",
          [{ text: "OK", style: "default" }],
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Bluetooth permission is required to set up a printer. You can enable it in Settings > Privacy > Bluetooth.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ],
        );
      }

      return granted;
    }

    // For other platforms
    return true;
  } catch (error) {
    console.error("Error showing permission dialog:", error);
    Alert.alert(
      "Error",
      "Failed to show permission information. Please try again.",
    );
    return false;
  }
};

/**
 * Check if printer permissions are configured
 * For Expo managed workflow, this simply returns true as permissions
 * are handled at the system level
 */
export const checkPrinterPermissions = async (): Promise<boolean> => {
  // In Expo managed workflow, permissions are handled by the system
  // This function returns true to indicate permission flow should proceed
  return true;
};
