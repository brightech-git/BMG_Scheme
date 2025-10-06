import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { BackHeader } from "../../components";
import { COLORS, SIZES, FONTS, moderateScale } from "../../utils/Theme";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { alignment } from "../../utils";

const SchemePassbook = ({ navigation, route }) => {
  const { productData, status, accountDetails } = route.params;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDreamGoldPlan =
    accountDetails?.schemeSummary?.schemeName?.trim() === "DREAM GOLD PLAN";

  // Date formatting
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Calculate scheme statistics
  const schemeStats = useMemo(() => {
    const totalPaid = parseFloat(productData?.amountWeight?.Amount || 0);
    const goldSaved = parseFloat(productData?.amountWeight?.Weight || 0);
    const installmentsPaid =
      accountDetails?.schemeSummary?.schemaSummaryTransBalance?.insPaid || 0;
    const totalInstallments = accountDetails?.schemeSummary?.instalment || 0;
    const progressPercentage =
      totalInstallments > 0 ? (installmentsPaid / totalInstallments) * 100 : 0;

    return {
      totalPaid,
      goldSaved,
      installmentsPaid,
      totalInstallments,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  }, [productData, accountDetails]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Data refreshed");
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Simplified payment history card
  const renderPaymentHistory = useCallback(
    ({ item, index }) => {
      const isLastItem =
        index === Math.min(2, accountDetails?.paymentHistoryList?.length - 1);
      return (
        <View style={[styles.transactionCard, isLastItem && styles.lastCard]}>
          <View style={styles.transactionIconContainer}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.transactionIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="payment" size={18} color={COLORS.white} />
            </LinearGradient>
          </View>
          <View style={styles.transactionContent}>
            <Text style={styles.transactionInstallment}>
              Installment {item.installment}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.updateTime)}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text style={styles.transactionAmount}>₹ {item.amount}</Text>
          </View>
        </View>
      );
    },
    [formatDate]
  );

  // Progress bar component
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Completion Progress</Text>
        <Text style={styles.progressPercentage}>
          {schemeStats.progressPercentage.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={[
            styles.progressBarFill,
            { width: `${schemeStats.progressPercentage}%` },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/bg4.jpg")}
      style={styles.mainBackground}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <CommonHeader title="Scheme Passbook" />

          {/* Floating Card */}
          <View style={styles.floatingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.schemeNameContainer}>
                <View style={styles.schemeBadge}>
                  <MaterialIcons
                    name="stars"
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.schemeName} numberOfLines={2}>
                  {productData?.pname || "Scheme Name"}
                </Text>
              </View>
              <View style={styles.schemeStatusContainer}>
                <Text style={styles.schemeStatus}>{status}</Text>
              </View>
            </View>

            {isDreamGoldPlan && <ProgressBar />}

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.statValue}>
                  ₹{schemeStats.totalPaid.toLocaleString("en-IN")}
                </Text>
                <Text style={styles.statLabel}>Total Paid</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons
                    name={isDreamGoldPlan ? "event-note" : "show-chart"}
                    size={20}
                    color={COLORS.secondary}
                  />
                </View>
                <Text style={styles.statValue}>
                  {isDreamGoldPlan
                    ? `${schemeStats.installmentsPaid}/${schemeStats.totalInstallments}`
                    : `${schemeStats.goldSaved}g`}
                </Text>
                <Text style={styles.statLabel}>
                  {isDreamGoldPlan ? "Installments" : "Gold Saved"}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {/* Info Cards Grid */}
            <View style={styles.infoCardsGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Icon name="calendar" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.infoCardLabel}>Join Date</Text>
                <Text style={styles.infoCardValue}>
                  {formatDate(productData?.joindate)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Icon
                    name="calendar-check-o"
                    size={18}
                    color={COLORS.success}
                  />
                </View>
                <Text style={styles.infoCardLabel}>Maturity</Text>
                <Text style={styles.infoCardValue}>
                  {formatDate(productData?.maturityDate)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Icon name="line-chart" size={18} color={COLORS.secondary} />
                </View>
                <Text style={styles.infoCardLabel}>Avg Rate</Text>
                <Text style={styles.infoCardValue}>
                  ₹
                  {(
                    schemeStats.totalPaid / Math.max(schemeStats.goldSaved, 1)
                  ).toFixed(0)}
                  /g
                </Text>
              </View>
            </View>

            {/* Payment History Section */}
            <View style={styles.historySection}>
              <View style={styles.historySectionHeader}>
                <View>
                  <Text style={styles.historyTitle}>Payment History</Text>
                  <Text style={styles.historySubtitle}>
                    {accountDetails?.paymentHistoryList?.length || 0}{" "}
                    transactions
                  </Text>
                </View>
                {accountDetails?.paymentHistoryList?.length > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() =>
                      navigation.navigate("PaymentHistory", {
                        accountDetails,
                        schemeName: productData?.pname,
                        productdata: productData, 
                      })
                    }
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>
                    Loading transactions...
                  </Text>
                </View>
              ) : accountDetails?.paymentHistoryList?.length > 0 ? (
                <View style={styles.transactionsList}>
                  {accountDetails?.paymentHistoryList
                    .slice(0, 3)
                    .map((item, index) => (
                      <View
                        key={item.receiptNo || `${item.installment}-${index}`}
                      >
                        {renderPaymentHistory({ item, index })}
                      </View>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="inbox" size={40} color={COLORS.borderColor} />
                  </View>
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Your payment history will appear here
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainBackground: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.7,
  },
  floatingCard: {
    backgroundColor: COLORS.label1,
    marginHorizontal: SIZES.padding,
    marginTop: moderateScale(12),
    padding: moderateScale(20),
    borderRadius: SIZES.radius_lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: moderateScale(40),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // center vertically
    marginBottom: moderateScale(16),
  },

  schemeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // prevent overflow pushing status out
  },

  schemeBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
  },

  schemeName: {
    ...FONTS.heading,
    color: COLORS.title,
    flexShrink: 1, // allow wrapping
    fontSize:SIZES.h6
  },

  schemeStatusContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    alignSelf: "center", // keeps it aligned vertically
  },

  schemeStatus: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "600",
  },

  progressContainer: {
    marginBottom: moderateScale(20),
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(8),
  },
  progressLabel: {
    ...FONTS.subheading,
    color: COLORS.textLight,
     fontSize:SIZES.fontSm
  },
  progressPercentage: {
    ...FONTS.font,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBarBackground: {
    height: moderateScale(8),
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: moderateScale(4),
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: moderateScale(4),
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statIconWrapper: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(8),
  },
  statValue: {
    ...FONTS.body1,
    color: COLORS.title,
    marginBottom: moderateScale(4),
     fontSize:SIZES.h6
  },
  statLabel: {
    ...FONTS.font,
    color: COLORS.textLight,
    ...FONTS.body1
  },
  statDivider: {
    width: 1,
    height: moderateScale(50),
    backgroundColor: COLORS.borderColor,
  },
  content: {
    padding: SIZES.padding,
    marginTop: moderateScale(-50),
  },
  infoCardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(24),
    gap: moderateScale(12),
  },
  infoCard: {
    backgroundColor: COLORS.white,
    flex: 1,
    padding: moderateScale(16),
    borderRadius: SIZES.radius,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(10),
  },
  infoCardLabel: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    marginBottom: moderateScale(4),
     fontSize:SIZES.font+1,
     alignItems:"center",
     justifyContent:"center"
  },
  infoCardValue: {
    ...FONTS.body1,
    fontWeight: "600",
    color: COLORS.title,
    textAlign: "center",
    marginTop: moderateScale(4),
    // fontSize:SIZES.h6
  },
  historySection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(20),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  historyTitle: {
    ...FONTS.h5,
    color: COLORS.title,
  },
  historySubtitle: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    marginTop: moderateScale(2),
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    gap: moderateScale(6),
    justifyContent:"space-between"
  },
  viewAllText: {
    ...FONTS.subheading,
    color: COLORS.primary,
    fontWeight: "600",
  },
  transactionsList: {
    gap: moderateScale(10),
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: moderateScale(14),
    borderRadius: SIZES.radius,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  lastCard: {
    marginBottom: 0,
  },
  transactionIconContainer: {
    marginRight: moderateScale(12),
  },
  transactionIconGradient: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
  },
  transactionInstallment: {
    ...FONTS.body1,
    fontWeight: "600",
    color: COLORS.title,
    marginBottom: moderateScale(2),
  },
  transactionDate: {
    ...FONTS.subheading,
    color: COLORS.textLight,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...FONTS.body1,
    fontWeight: "700",
    color: COLORS.primary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: moderateScale(40),
  },
  loadingText: {
    ...FONTS.font,
    color: COLORS.textLight,
    marginTop: moderateScale(12),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: moderateScale(40),
  },
  emptyIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  emptyStateText: {
    ...FONTS.font,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: moderateScale(4),
  },
  emptyStateSubtext: {
    ...FONTS.fontSm,
    color: COLORS.textLight,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default SchemePassbook;
