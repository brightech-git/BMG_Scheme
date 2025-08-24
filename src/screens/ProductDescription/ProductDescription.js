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
  Alert,
  ActivityIndicator,
  Animated,
  Share,
  Platform
} from 'react-native';
import { BackHeader } from '../../components';
import { alignment, colors, scale } from '../../utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors1 } from '../../utils/colors';

const SchemePassbook = ({ navigation, route }) => {
  const { productData, status, accountDetails } = route.params;
  
  // Enhanced state management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const isDreamGoldPlan = accountDetails?.schemeSummary?.schemeName?.trim() === 'DREAM GOLD PLAN';

  // Enhanced date formatting with error handling
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

  const formatDateTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return (
        date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ' ' +
        date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Enhanced payment history with sorting
  const paymentHistory = useMemo(() => {
    let history = accountDetails?.paymentHistoryList || [];
    
    // Apply sorting
    history.sort((a, b) => {
      const dateA = new Date(a.updateTime || a.date);
      const dateB = new Date(b.updateTime || b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return history;
  }, [accountDetails?.paymentHistoryList, sortOrder]);

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

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for refreshing data
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Here you would typically call an API to refresh the data
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

  // Enhanced transaction card with animation
  const renderPaymentHistory = useCallback(({ item, index }) => {
    const isLastItem = index === (showFullHistory ? paymentHistory.length - 1 : Math.min(2, paymentHistory.length - 1));
    const status = item.status?.toLowerCase() || 'paid';
    const isPaid = status === 'paid';

    return (
      <TouchableOpacity 
        style={[
          styles.transactionCard,
          isLastItem && styles.lastCard,
          !isPaid && styles.pendingCard
        ]}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to transaction details or show more info
          Alert.alert(
            'Transaction Details',
            `Installment: ${item.installment}\nAmount: ₹${item.amount}\nDate: ${formatDateTime(item.updateTime)}\nStatus: ${isPaid ? 'Paid' : 'Pending'}`,
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.transactionLeft}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isPaid ? colors1.success : colors1.warning }
          ]}>
            <Icon 
              name={isPaid ? "check-circle" : "clock-o"} 
              size={20} 
              color={colors.white} 
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDate}>{formatDateTime(item.updateTime)}</Text>
            <Text style={styles.transactionInstallment}>Installment {item.installment}</Text>
            {item.receiptNo && (
              <Text style={styles.receiptNo}>Receipt: {item.receiptNo}</Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            !isPaid && { color: colors1.warning }
          ]}>
            ₹ {item.amount}
          </Text>
          <Text style={[
            styles.statusText,
            { color: isPaid ? colors1.success : colors1.warning }
          ]}>
            {isPaid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [paymentHistory.length, showFullHistory, formatDateTime]);

  // Progress bar component
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { width: `${schemeStats.progressPercentage}%` }
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
        {/* Enhanced Header with Actions */}
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
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <MaterialIcons name="share" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <MaterialIcons 
                  name={sortOrder === 'desc' ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                  size={20} 
                  color={colors.white} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Enhanced Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.schemeName}>
              {productData?.pname || 'Scheme Name'}
            </Text>
            
            {/* Progress Bar for Dream Gold Plan */}
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
          {/* Enhanced Info Cards Section */}
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

          {/* Enhanced Payment History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                Payment History ({paymentHistory.length})
              </Text>
              {paymentHistory.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowFullHistory(!showFullHistory)}
                >
                  <Text style={styles.viewAllText}>
                    {showFullHistory ? 'Show Less' : 'View All'}
                  </Text>
                  <Icon 
                    name={showFullHistory ? "chevron-up" : "chevron-right"} 
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
            ) : paymentHistory.length > 0 ? (
              <View style={styles.transactionsList}>
                {(showFullHistory ? paymentHistory : paymentHistory.slice(0, 3))
                  .map((item, index) => (
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
  headerActions: {
    flexDirection: 'row',
    marginRight: scale(20),
  },
  actionButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
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
    padding: scale(15),
    borderRadius: scale(15),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pendingCard: {
    borderColor: colors1.warning,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  lastCard: {
    marginBottom: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors1.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  transactionDetails: {
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
  receiptNo: {
    fontSize: scale(10),
    color: colors1.textSecondary,
    marginTop: scale(2),
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors1.primary,
    marginBottom: scale(2),
  },
  statusText: {
    fontSize: scale(11),
    fontWeight: '500',
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