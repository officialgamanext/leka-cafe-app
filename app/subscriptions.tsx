import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useUpdateApiTenant } from "@/hooks/use-api-tenants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Plan {
  id: string;
  duration: string;
  durationMonths: number;
  price: number;
  priceInWords: string;
  recommended: boolean;
  features: string[];
  staffAccounts: number;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    duration: "Monthly",
    durationMonths: 1,
    price: 799,
    priceInWords: "₹799 per month",
    recommended: false,
    features: [
      "Access to all features",
      "1 Staff Account",
      "Receipt Printing",
      "Basic Analytics",
      "Customer Support",
    ],
    staffAccounts: 1,
  },
  {
    id: "sixmonths",
    duration: "6 Months",
    durationMonths: 6,
    price: 3333,
    priceInWords: "₹3,333 for 6 months",
    recommended: true,
    features: [
      "Access to all features",
      "1 Staff Account",
      "Receipt Printing",
      "Advanced Analytics",
      "Priority Support",
      "20% Savings",
    ],
    staffAccounts: 1,
  },
  {
    id: "oneyear",
    duration: "1 Year",
    durationMonths: 12,
    price: 6666,
    priceInWords: "₹6,666 per year",
    recommended: false,
    features: [
      "Access to all features",
      "2 Staff Accounts",
      "Receipt Printing",
      "Advanced Analytics",
      "Priority Support",
      "Custom Reports",
      "38% Savings",
    ],
    staffAccounts: 2,
  },
];

export default function SubscriptionsScreen() {
  const { currentBusiness, selectBusiness } = useAuth();
  const { mutate: updateTenant, isPending: isUpdatingTenant } =
    useUpdateApiTenant();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribeToPlan = (plan: Plan) => {
    if (!currentBusiness?.id) {
      Alert.alert("Business not selected", "Please select a business first.");
      return;
    }

    Alert.alert(
      "Subscribe to Plan",
      `Subscribe to ${plan.duration} plan for ${plan.priceInWords}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Subscribe",
          style: "default",
          onPress: () => {
            setSelectedPlan(plan.id);
            const payload = {
              name: currentBusiness.name,
              address: currentBusiness.address,
              logoUrl: currentBusiness.logo || "/logo.png",
              defaultTaxRate: currentBusiness.defaultTaxRate,
              leagalInfo: currentBusiness.leagalInfo,
              subscription: {
                status: true,
                planId: plan.id,
                duration: plan.durationMonths,
                amount: plan.price,
                startDate: new Date().toISOString(),
                endDate: new Date(
                  Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              },
            };

            updateTenant(
              { tenantId: currentBusiness.id, payload },
              {
                onSuccess: () => {
                  const startDate = new Date();
                  const endDate = new Date(
                    Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000,
                  );
                  selectBusiness({
                    ...currentBusiness,
                    subscription: {
                      status: true,
                      planId: plan.id,
                      duration: plan.durationMonths,
                      amount: plan.price,
                      startDate,
                      endDate,
                    },
                  });
                  Alert.alert(
                    "Success",
                    `You have subscribed to the ${plan.duration} plan!`,
                    [
                      {
                        text: "OK",
                        onPress: () => router.back(),
                      },
                    ],
                  );
                },
                onError: (error) => {
                  setSelectedPlan(null);
                  Alert.alert("Error", error.message || "Failed to subscribe");
                },
              },
            );
          },
        },
      ],
    );
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          plan.recommended && styles.planCardRecommended,
          isSelected && styles.planCardSelected,
        ]}
      >
        {plan.recommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={14} color={BrandColors.white} />
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}

        <Text style={styles.planDuration}>{plan.duration}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ₹{plan.price.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.priceSubtext}>
            (
            {Math.round(plan.price / plan.durationMonths).toLocaleString(
              "en-IN",
            )}
            /month avg)
          </Text>
        </View>

        <View style={styles.staffBadge}>
          <Ionicons
            name="people-outline"
            size={14}
            color={BrandColors.primary}
          />
          <Text style={styles.staffText}>
            {plan.staffAccounts} Staff{" "}
            {plan.staffAccounts === 1 ? "Account" : "Accounts"}
          </Text>
        </View>

        <View style={styles.featuresList}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={BrandColors.success}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            plan.recommended && styles.subscribeButtonPrimary,
            isSelected && styles.subscribeButtonDisabled,
          ]}
          onPress={() => handleSubscribeToPlan(plan)}
          disabled={isSelected || isUpdatingTenant}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.subscribeButtonText,
              plan.recommended && styles.subscribeButtonTextPrimary,
            ]}
          >
            {isSelected ? "Processing..." : "Choose Plan"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentPlan = PLANS.find(
    (p) => p.id === currentBusiness?.subscription?.planId,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BrandColors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color={BrandColors.gray[900]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans & Pricing</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Info */}
        {currentPlan && (
          <View style={styles.currentPlanInfo}>
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={BrandColors.success}
            />
            <Text style={styles.currentPlanTitle}>Current Plan</Text>
            <Text style={styles.currentPlanName}>{currentPlan.duration}</Text>
            <Text style={styles.currentPlanPrice}>
              ₹{currentPlan.price.toLocaleString("en-IN")}
            </Text>
          </View>
        )}

        {/* Plans Container */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => renderPlanCard(plan))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons
              name="card-outline"
              size={20}
              color={BrandColors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Easy Payment</Text>
              <Text style={styles.infoDesc}>
                Secure payment methods for hassle-free subscription
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={BrandColors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Auto Renewal</Text>
              <Text style={styles.infoDesc}>
                Plans renewal automatically at the end of billing period
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={BrandColors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Support</Text>
              <Text style={styles.infoDesc}>
                24/7 customer support for all subscription queries
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All prices are in Indian Rupees (₹). Applicable taxes will be added
            at checkout.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray[50],
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray[200],
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
  },
  currentPlanInfo: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: BrandColors.success + "15",
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.success,
    alignItems: "center",
  },
  currentPlanTitle: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    marginTop: Spacing.xs,
  },
  currentPlanName: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginTop: Spacing.xs,
  },
  currentPlanPrice: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.success,
    marginTop: Spacing.xs,
  },
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: BrandColors.gray[200],
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  planCardRecommended: {
    borderColor: BrandColors.primary,
    borderWidth: 2,
    backgroundColor: BrandColors.primary + "08",
  },
  planCardSelected: {
    borderColor: BrandColors.success,
    backgroundColor: BrandColors.success + "08",
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    gap: 4,
  },
  recommendedText: {
    fontSize: FontSizes.xs,
    fontWeight: "700",
    color: BrandColors.white,
  },
  planDuration: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: BrandColors.gray[900],
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  priceSubtext: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    marginTop: 4,
  },
  staffBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignSelf: "flex-start",
    gap: 6,
  },
  staffText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
    color: BrandColors.primary,
  },
  featuresList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[700],
    flex: 1,
    marginTop: 2,
  },
  subscribeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    alignItems: "center",
    backgroundColor: BrandColors.white,
  },
  subscribeButtonPrimary: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  subscribeButtonTextPrimary: {
    color: BrandColors.white,
  },
  infoSection: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: BrandColors.gray[900],
    marginBottom: Spacing.xs,
  },
  infoDesc: {
    fontSize: FontSizes.sm,
    color: BrandColors.gray[600],
    lineHeight: 20,
  },
  footer: {
    paddingBottom: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: BrandColors.gray[500],
    textAlign: "center",
    lineHeight: 18,
  },
});
