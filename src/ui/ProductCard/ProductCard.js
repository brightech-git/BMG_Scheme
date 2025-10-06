import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextDefault } from '../../components';
import { colors, scale } from '../../utils';
import { COLORS, SIZES, FONTS, moderateScale } from '../../utils/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function ProductCard({
  productData,
  loading,
  error,
  navigation,
  status,
  accountDetails,
}) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={40} color={COLORS.danger} />
        <TextDefault style={styles.errorText}>{error}</TextDefault>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isDreamGoldPlan =
    accountDetails?.schemeSummary?.schemeName?.trim() === 'DREAM GOLD PLAN';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDescription', {
          productData,
          status,
          accountDetails,
        })
      }
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={COLORS.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBadge}>
              <MaterialIcons name="account-balance" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.headerInfo}>
              <TextDefault style={styles.schemeCode}>
                {productData.groupcode} - {productData.regno}
              </TextDefault>
              <TextDefault style={styles.schemeName} numberOfLines={1}>
                {productData.pname}
              </TextDefault>
            </View>
          </View>
          
          {status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: status === 'Active' ? COLORS.success : COLORS.danger }
            ]}>
              <TextDefault style={styles.statusText}>{status}</TextDefault>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialIcons 
              name={isDreamGoldPlan ? "event-note" : "scale"} 
              size={20} 
              color="rgba(255,255,255,0.9)" 
            />
            <TextDefault style={styles.statLabel}>
              {isDreamGoldPlan ? 'Installments' : 'Weight Saved'}
            </TextDefault>
            <TextDefault style={styles.statValue}>
              {isDreamGoldPlan
                ? `${accountDetails?.schemeSummary?.schemaSummaryTransBalance?.insPaid || 0}/${accountDetails?.schemeSummary?.instalment || 0}`
                : `${productData.amountWeight?.Weight || 0}g`}
            </TextDefault>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons name="payments" size={20} color="rgba(255,255,255,0.9)" />
            <TextDefault style={styles.statLabel}>Total Amount</TextDefault>
            <TextDefault style={styles.statValue}>
              ₹{parseFloat(productData.amountWeight?.Amount || 0).toLocaleString('en-IN')}
            </TextDefault>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons name="event" size={20} color="rgba(255,255,255,0.9)" />
            <TextDefault style={styles.statLabel}>Maturity</TextDefault>
            <TextDefault style={styles.statValue} numberOfLines={1}>
              {formatDate(productData.maturityDate)}
            </TextDefault>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('ProductDescription', {
                productData,
                status,
                accountDetails,
              })
            }
            activeOpacity={0.7}
          >
            <MaterialIcons name="visibility" size={16} color={COLORS.primary} />
            <TextDefault style={styles.actionButtonText}>View Details</TextDefault>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() =>
              navigation.navigate('Buy', {
                productData,
                status,
                accountDetails,
                isDreamGoldPlan,
              })
            }
            activeOpacity={0.7}
          >
            <MaterialIcons name="payment" size={16} color={COLORS.white} />
            <TextDefault style={styles.payButtonText}>Pay Now</TextDefault>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    margin: moderateScale(8),
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientBackground: {
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(16),
  },
  loadingContainer: {
    padding: moderateScale(40),
    alignItems: 'center',
  },
  errorContainer: {
    padding: moderateScale(30),
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: moderateScale(8),
    borderRadius: SIZES.radius_lg,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: moderateScale(10),
    fontSize: moderateScale(13),
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(12),
  },
  iconBadge: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  schemeCode: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    // fontWeight: '600',
    opacity: 0.9,
    marginBottom: moderateScale(2),
    ...FONTS.subheading
  },
  schemeName: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    // fontWeight: '700',
    ...FONTS.body1
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontWeight: '700',
  ...FONTS.body1
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SIZES.radius,
    padding: moderateScale(12),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: moderateScale(4),
  },
  statLabel: {
    color: 'rgb(255, 255, 255)',
    fontSize: moderateScale(11),
    fontWeight: '500',
    textAlign: 'center',
    ...FONTS.body1
  },
  statValue: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '700',
    textAlign: 'center',
    ...FONTS.body1
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: moderateScale(8),
  },
  actionContainer: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom: moderateScale(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(10),
    gap: moderateScale(6),
  },
  payButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: moderateScale(12),
    fontWeight: '700',
    ...FONTS.body1
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '700',
     ...FONTS.body1
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(6),
  },
  infoBannerText: {
    color: COLORS.white,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
});

export default ProductCard;