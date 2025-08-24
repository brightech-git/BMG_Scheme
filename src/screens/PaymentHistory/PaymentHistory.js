import React from 'react';
import { View, Text, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import { BackHeader } from '../../components';
import { alignment, colors, scale } from '../../utils';
import Icon from 'react-native-vector-icons/FontAwesome';

const PaymentHistory = ({ navigation, route }) => {
  const { accountDetails, schemeName } = route.params;
  
  // Get payment history from accountDetails
  const paymentHistory = accountDetails?.paymentHistoryList || [];

  // Format date and time for payment history
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate total amount paid
  const totalAmountPaid = paymentHistory.reduce((total, payment) => {
    return total + parseFloat(payment.amount || 0);
  }, 0);

  // Get last payment date
  const lastPaymentDate = paymentHistory.length > 0 
    ? paymentHistory[paymentHistory.length - 1].updateTime 
    : null;

  // Calculate average payment amount
  const averagePaymentAmount = paymentHistory.length > 0 
    ? totalAmountPaid / paymentHistory.length 
    : 0;

  // Render each payment history item
  const renderPaymentHistory = ({ item, index }) => {
    return (
      <View style={styles.paymentItem}>
        <View style={styles.paymentHeader}>
          <View style={styles.receiptContainer}>
            <Icon name="receipt" size={16} color={colors.lightmaroon} />
            <Text style={styles.receiptText}>Receipt #{item.receiptNo}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.statusText}>Paid</Text>
          </View>
        </View>
        
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Installment:</Text>
            <Text style={styles.detailValue}>{item.installment}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₹ {item.amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>{formatDateTime(item.updateTime)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader
        title="Payment History"
        backPressed={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Header Card */}
       

        {/* Payment History List */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Payment Details</Text>
          
          {paymentHistory.length > 0 ? (
            <FlatList
              data={paymentHistory}
              renderItem={renderPaymentHistory}
              keyExtractor={(item, index) => item.receiptNo || index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="inbox" size={48} color={colors.fontThirdColor} />
              <Text style={styles.noDataText}>No payment history available</Text>
              <Text style={styles.noDataSubtext}>Your payment history will appear here once you make payments</Text>
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
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: scale(12),
  },
  headerCard: {
    backgroundColor: '#FDF6D3',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(16),
  },
  schemeTitle: {
    color: colors.lightmaroon,
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: scale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: colors.fontMainColor,
    fontSize: scale(12),
    opacity: 0.8,
    marginBottom: scale(4),
  },
  summaryValue: {
    color: colors.fontSecondColor,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(12),
    color: colors.fontMainColor,
  },
  listContainer: {
    paddingBottom: scale(20),
  },
  paymentItem: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  receiptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptText: {
    fontSize: scale(12),
    color: colors.lightmaroon,
    fontWeight: '600',
    marginLeft: scale(4),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: scale(12),
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: scale(4),
  },
  paymentDetails: {
    gap: scale(4),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: scale(12),
    color: colors.fontMainColor,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: scale(12),
    color: colors.fontSecondColor,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  noDataText: {
    color: colors.fontMainColor,
    fontSize: scale(16),
    fontWeight: '600',
    marginTop: scale(12),
    marginBottom: scale(4),
  },
  noDataSubtext: {
    color: colors.fontThirdColor,
    fontSize: scale(12),
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
});

export default PaymentHistory; 