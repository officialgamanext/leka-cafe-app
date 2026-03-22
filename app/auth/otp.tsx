import {
  BorderRadius,
  BrandColors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useVerifyOtpRequest } from "@/hooks/use-api-auth";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

export default function OTPScreen() {
  const insets = useSafeAreaInsets();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { login } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);
  const { mutate, isPending } = useVerifyOtpRequest();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedOtp.length - 1, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the complete 6-digit OTP",
      });
      return;
    }
    mutate(
      { phone: `+91${mobile}`, code: otpCode },
      {
        onSuccess: (data) => {
          login(
            {
              id: data.data.user.uid,
              name: data.data.user.firstName,
              mobile: mobile || "",
            },
            data.data.token,
            data.data.refreshToken,
          );
          router.replace("/auth/business-list");
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message || "Failed to verify OTP",
          });
        },
      },
    );
  };

  const handleResendOTP = () => {
    setResendTimer(30);
    Toast.show({
      type: "success",
      text1: "OTP Resent",
      text2: "A new OTP has been sent to your mobile number",
    });
  };

  const otpComplete = otp.every((digit) => digit !== "");

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
            <Ionicons name="shield-checkmark" size={48} color={BrandColors.primary} />
          </View>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.mobileNumber}>+91 {mobile}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit !== "" && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendText}>
              Resend code in <Text style={styles.timerText}>{resendTimer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            !otpComplete && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={!otpComplete || isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color={BrandColors.white} size="small" />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={BrandColors.white}
              />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.changeNumberText}>Entered wrong number?</Text>
        </TouchableOpacity>
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
  mobileNumber: {
    fontWeight: "700",
    color: BrandColors.primary,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  otpInput: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.gray[50],
    fontSize: FontSizes.xl,
    fontWeight: "800",
    textAlign: "center",
    color: BrandColors.gray[900],
    borderWidth: 1.5,
    borderColor: BrandColors.gray[100],
  },
  otpInputFilled: {
    backgroundColor: BrandColors.primary + "05",
    borderColor: BrandColors.primary,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[500],
    fontWeight: "500",
  },
  timerText: {
    fontWeight: "700",
    color: BrandColors.primary,
  },
  resendLink: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: BrandColors.accent,
  },
  verifyButton: {
    backgroundColor: BrandColors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.md,
  },
  verifyButtonDisabled: {
    backgroundColor: BrandColors.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  changeNumberButton: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  changeNumberText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[400],
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
