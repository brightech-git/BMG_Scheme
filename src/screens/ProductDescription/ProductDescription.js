import React, { useState, useCallback, useMemo } from 'react';
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
  Share,
} from 'react-native';
import { BackHeader } from '../../components';
import { alignment, colors, scale } from '../../utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors1 } from '../../utils/colors';

const SchemePassbook = ({ navigation, route }) => {
  const { productData, status, accountDetails } = route.params;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDreamGoldPlan = accountDetails?.schemeSummary?.schemeName?.trim() === 'DREAM GOLD PLAN';

  // Date formatting
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Calculate scheme statistics
  const schemeStats = useMemo(() => {
    const totalPaid = parseFloat(productData?.amountWeight?.Amount || 0);
    const goldSaved = parseFloat(productData?.amountWeight?.Weight || 0);
    const installmentsPaid = accountDetails?.schemeSummary?.schemaSummaryTransBalance?.insPaid || 0;
    const totalInstallments = accountDetails?.schemeSummary?.instalment || 0;
    const progressPercentage = totalInstallments > 0 ? (installmentsPaid / totalInstallments) * 100 : 0;

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Data refreshed');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Share scheme details
  const handleShare = useCallback(async () => {
    try {
      const message = `My ${productData?.pname || 'Gold Scheme'} Details:
      
Total Paid: ₹${schemeStats.totalPaid}
${isDreamGoldPlan ? `Installments: ${schemeStats.installmentsPaid}/${schemeStats.totalInstallments}` : `Gold Saved: ${schemeStats.goldSaved}g`}
Join Date: ${formatDate(productData?.joindate)}
Maturity Date: ${formatDate(productData?.maturityDate)}`;

      await Share.share({
        message,
        title: 'Scheme Passbook Details',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  }, [productData, schemeStats, isDreamGoldPlan, formatDate]);

  // Simplified payment history card
  const renderPaymentHistory = useCallback(({ item, index }) => {
    const isLastItem = index === Math.min(2, accountDetails?.paymentHistoryList?.length - 1);
    return (
      <View
        style={[
          styles.transactionCard,
          isLastItem && styles.lastCard,
        ]}
      >
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionDate}>{formatDate(item.updateTime)}</Text>
          <Text style={styles.transactionInstallment}>Installment {item.installment}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>₹ {item.amount}</Text>
        </View>
      </View>
    );
  }, [formatDate]);

  // Progress bar component
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${schemeStats.progressPercentage}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {schemeStats.progressPercentage.toFixed(1)}% Complete
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors1.primary]}
            tintColor={colors1.primary}
          />
        }
      >
        <LinearGradient
          colors={[colors1.primary, colors1.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <BackHeader
              title="Scheme Passbook"
              backPressed={() => navigation.goBack()}
              titleColor={colors.white}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCard}>
            <Text style={styles.schemeName}>
              {productData?.pname || 'Scheme Name'}
            </Text>

            {isDreamGoldPlan && <ProgressBar />}

            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ₹ {schemeStats.totalPaid.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.statLabel}>Total Paid</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {isDreamGoldPlan
                    ? `${schemeStats.installmentsPaid}/${schemeStats.totalInstallments}`
                    : `${schemeStats.goldSaved}g`}
                </Text>
                <Text style={styles.statLabel}>
                  {isDreamGoldPlan ? 'Installments' : 'Gold Saved'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.infoCardsContainer}>
            <TouchableOpacity style={styles.infoCard}>
              <Icon name="calendar" size={20} color={colors1.primary} />
              <Text style={styles.infoCardLabel}>Join Date</Text>
              <Text style={styles.infoCardValue}>
                {formatDate(productData?.joindate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCard}>
              <Icon name="calendar-check-o" size={20} color={colors1.primary} />
              <Text style={styles.infoCardLabel}>Maturity Date</Text>
              <Text style={styles.infoCardValue}>
                {formatDate(productData?.maturityDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCard}>
              <Icon name="line-chart" size={20} color={colors1.primary} />
              <Text style={styles.infoCardLabel}>Avg Rate</Text>
              <Text style={styles.infoCardValue}>
                ₹ {(schemeStats.totalPaid / Math.max(schemeStats.goldSaved, 1)).toFixed(0)}/g
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                Recent Payments ({accountDetails?.paymentHistoryList?.length || 0})
              </Text>
              {accountDetails?.paymentHistoryList?.length > 0 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                    onPress={() => navigation.navigate('PaymentHistory', {
    accountDetails: accountDetails,
    schemeName: productData?.pname,
  })
  }
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Icon
                    name="chevron-right"
                    size={12}
                    color={colors1.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors1.primary} />
                <Text style={styles.loadingText}>Loading transactions...</Text>
              </View>
            ) : accountDetails?.paymentHistoryList?.length > 0 ? (
              <View style={styles.transactionsList}>
                {accountDetails?.paymentHistoryList.slice(0, 3).map((item, index) => (
                  <View key={item.receiptNo || `${item.installment}-${index}`}>
                    {renderPaymentHistory({ item, index })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="inbox" size={48} color={colors1.borderLight} />
                <Text style={styles.emptyStateText}>No transactions found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your payment history will appear here
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors1.background,
  },
  headerGradient: {
    paddingBottom: scale(20),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    elevation: 8,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(20),
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: scale(20),
    marginTop: scale(10),
    padding: scale(15),
    borderRadius: scale(15),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  schemeName: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.white,
    marginBottom: scale(12),
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: scale(12),
  },
  progressBarBackground: {
    height: scale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: scale(3),
    marginBottom: scale(8),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: scale(3),
  },
  progressText: {
    fontSize: scale(12),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: scale(20),
    fontWeight: '600',
    color: colors.white,
    marginBottom: scale(4),
  },
  statLabel: {
    fontSize: scale(12),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: scale(35),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: scale(20),
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(-30),
    marginBottom: scale(25),
  },
  infoCard: {
    backgroundColor: colors.white,
    flex: 1,
    marginHorizontal: scale(5),
    padding: scale(15),
    borderRadius: scale(15),
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardLabel: {
    fontSize: scale(11),
    color: colors1.textSecondary,
    marginTop: scale(8),
    marginBottom: scale(4),
  },
  infoCardValue: {
    fontSize: scale(13),
    fontWeight: '600',
    color: colors1.primaryText,
    textAlign: 'center',
  },
  historySection: {
    backgroundColor: colors.white,
    borderRadius: scale(20),
    padding: scale(20),
    elevation: 3,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  historyTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors1.primaryText,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors1.sectionBackground,
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  viewAllText: {
    fontSize: scale(13),
    color: colors1.primary,
    fontWeight: '600',
    marginRight: scale(4),
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: scale(30),
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scale(14),
    color: colors1.textSecondary,
  },
  transactionsList: {
    marginTop: scale(5),
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors1.sectionBackground,
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: scale(8),
  },
  lastCard: {
    marginBottom: 0,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: scale(14),
    fontWeight: '500',
    color: colors1.primaryText,
    marginBottom: scale(2),
  },
  transactionInstallment: {
    fontSize: scale(12),
    color: colors1.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors1.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  emptyStateText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors1.textSecondary,
    marginTop: scale(15),
    marginBottom: scale(5),
  },
  emptyStateSubtext: {
    fontSize: scale(13),
    color: colors1.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default SchemePassbook;