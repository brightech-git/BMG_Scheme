import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BackHeader } from '../../components';
import { colors, scale } from '../../utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors1 } from '../../utils/colors';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentHistory = ({ navigation, route }) => {
  const { accountDetails, schemeName } = route.params;
  const [sortOrder, setSortOrder] = useState('desc');

  // Get payment history from accountDetails
  const paymentHistory = accountDetails?.paymentHistoryList || [];

  // Format date and time
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

  // Format date only
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

  // Calculate summary statistics
  const totalAmountPaid = paymentHistory.reduce((total, payment) => {
    return total + parseFloat(payment.amount || 0);
  }, 0);

  const lastPaymentDate = paymentHistory.length > 0
    ? paymentHistory[paymentHistory.length - 1].updateTime
    : null;

  const averagePaymentAmount = paymentHistory.length > 0
    ? totalAmountPaid / paymentHistory.length
    : 0;

  // Sort payment history
  const sortedHistory = [...paymentHistory].sort((a, b) => {
    const dateA = new Date(a.updateTime || a.date);
    const dateB = new Date(b.updateTime || b.date);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Render payment history item
  const renderPaymentHistory = useCallback(({ item, index }) => {
    const isLastItem = index === paymentHistory.length - 1;
    const status = item.status?.toLowerCase() || 'paid';
    const isPaid = status === 'paid';

    return (
      <TouchableOpacity
        style={[
          styles.transactionCard,
          isLastItem && styles.lastCard,
          !isPaid && styles.pendingCard,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          Alert.alert(
            'Transaction Details',
            `Installment: ${item.installment}\nAmount: ₹${item.amount}\nDate: ${formatDateTime(item.updateTime)}\nStatus: ${isPaid ? 'Paid' : 'Pending'}`,
            [{ text: 'OK' }],
          );
        }}
      >
        <View style={styles.transactionLeft}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isPaid ? colors1.success : colors1.warning },
          ]}>
            <Icon
              name={isPaid ? 'check-circle' : 'clock-o'}
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
            !isPaid && { color: colors1.warning },
          ]}>
            ₹ {item.amount}
          </Text>
          <Text style={[
            styles.statusText,
            { color: isPaid ? colors1.success : colors1.warning },
          ]}>
            {isPaid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [formatDateTime]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors1.primary, colors1.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <BackHeader
            title="Payment History"
            backPressed={() => navigation.goBack()}
            titleColor={colors.white}
          />
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            <Icon
              name={sortOrder === 'desc' ? 'sort-amount-desc' : 'sort-amount-asc'}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.schemeName}>
            {schemeName || 'Scheme Payment History'}
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹ {totalAmountPaid.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Total Paid</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDate(lastPaymentDate)}
              </Text>
              <Text style={styles.statLabel}>Last Payment</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹ {averagePaymentAmount.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Avg. Payment</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Payment Details</Text>
          {paymentHistory.length > 0 ? (
            <FlatList
              data={sortedHistory}
              renderItem={renderPaymentHistory}
              keyExtractor={(item, index) => item.receiptNo || `${item.installment}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
  },
  sortButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: scale(16),
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
    flex: 1,
    padding: scale(20),
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
  historyTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors1.primaryText,
    marginBottom: scale(15),
  },
  listContainer: {
    paddingBottom: scale(20),
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

export default PaymentHistory;