import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useApiSendOTP } from "@/hooks/use-api-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [mobileNumber, setMobileNumber] = useState("");
  const { mutate, isPending } = useApiSendOTP();

  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Number",
        text2: "Please enter a valid 10-digit mobile number",
      });
      return;
    }
    mutate(`+91${mobileNumber}`, {
      onSuccess: () => {
        router.push({
          pathname: "/auth/otp",
          params: { mobile: `${mobileNumber}` },
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to send OTP",
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: BrandColors.white }} />
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[800]} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to sign in or create a new account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="00000 00000"
              placeholderTextColor={BrandColors.gray[400]}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />
            {mobileNumber.length === 10 && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={BrandColors.success}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              mobileNumber.length !== 10 && styles.continueButtonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={mobileNumber.length !== 10 || isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color={BrandColors.white} size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Send OTP</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={BrandColors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={BrandColors.primary}
          />
          <Text style={styles.infoText}>
            Secure and simple login with OTP verification
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    backgroundColor: BrandColors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: BrandColors.gray[100],
    ...Shadows.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "800",
    color: BrandColors.gray[900],
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[500],
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: BrandColors.gray[400],
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.gray[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 60,
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  countryCode: {
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: BrandColors.gray[200],
    marginRight: Spacing.md,
  },
  countryCodeText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.gray[800],
  },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: BrandColors.gray[900],
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  continueButton: {
    backgroundColor: BrandColors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.md,
  },
  continueButtonDisabled: {
    backgroundColor: BrandColors.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
    backgroundColor: BrandColors.primary + "08",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    flex: 1,
    fontWeight: "500",
  },
});
