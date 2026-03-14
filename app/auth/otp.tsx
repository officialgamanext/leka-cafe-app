import {
    BorderRadius,
    BrandColors,
    FontSizes,
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
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function OTPScreen() {
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
      // Handle paste
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

    // Auto-focus next input
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
          return;
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.gray[800]} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="keypad-outline"
              size={40}
              color={BrandColors.primary}
            />
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.mobileNumber}>+91 {mobile}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Timer */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendText}>
              Resend OTP in <Text style={styles.timerText}>{resendTimer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
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
                name="checkmark-circle"
                size={20}
                color={BrandColors.white}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Change Number */}
        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={() => router.back()}
        >
          <Text style={styles.changeNumberText}>Change mobile number</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  header: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    lineHeight: 22,
  },
  mobileNumber: {
    fontWeight: "600",
    color: BrandColors.gray[800],
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: BrandColors.gray[100],
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    textAlign: "center",
    color: BrandColors.gray[900],
  },
  otpInputFilled: {
    backgroundColor: BrandColors.primary + "15",
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
  },
  timerText: {
    fontWeight: "600",
    color: BrandColors.primary,
  },
  resendLink: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.accent,
  },
  verifyButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  verifyButtonDisabled: {
    backgroundColor: BrandColors.gray[400],
  },
  verifyButtonText: {
    color: BrandColors.white,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  changeNumberButton: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  changeNumberText: {
    fontSize: FontSizes.md,
    color: BrandColors.gray[600],
    textDecorationLine: "underline",
  },
});
