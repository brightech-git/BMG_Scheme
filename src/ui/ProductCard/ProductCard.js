import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { TextDefault } from '../../components'
import { alignment, colors, scale } from '../../utils'
import { colors1 } from '../../utils/colors'

function ProductCard({
  productData,
  loading,
  error,
  navigation,
  status,
  accountDetails
}) {
  if (loading) {
    return (
      <ActivityIndicator
        size='large'
        color={colors.greenColor}
        style={{ marginTop: 20 }}
      />
    )
  }

  if (error) {
    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <TextDefault style={{ color: colors.redColor }}>{error}</TextDefault>
      </View>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const isDreamGoldPlan =
    accountDetails?.schemeSummary?.schemeName?.trim() === 'DREAM GOLD PLAN'

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('ProductDescription', {
          productData,
          status,
          accountDetails
        })
      }
      style={styles.cardContainer}
    >
      {/* 🔥 Gradient Background */}
      <LinearGradient
        colors={[colors1.gradientcolor2, colors1.gradientcolor1]}
        start={{ x: 0, y: 0 }} // Top
        end={{ x: 0, y: 1 }} // Bottom
        style={styles.gradientBackground}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <View>
            <TextDefault style={styles.text} bold>
              {productData.groupcode} - {productData.regno}
              {isDreamGoldPlan && (
                <TextDefault style={[styles.text, { marginLeft: 10 }]}>
                  / ₹{accountDetails?.amount || 0}
                </TextDefault>
              )}
            </TextDefault>
            <TextDefault style={styles.text}>{productData.pname}</TextDefault>
          </View>
          <View style={styles.rightTop}>
            <TextDefault style={styles.text} bold>
              {accountDetails?.schemeSummary?.schemeName?.trim()}
            </TextDefault>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusContainer}>
          <TextDefault style={styles.text} bold>
            {status}
          </TextDefault>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: status === 'Active' ? '#4CAF50' : '#F44336' }
            ]}
          />
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <TextDefault style={[styles.text, styles.headerText]}>
                {isDreamGoldPlan ? 'Ins Paid' : 'Weight Saved*'}
              </TextDefault>
            </View>
            <View style={styles.headerTextContainer}>
              <TextDefault style={[styles.text, styles.headerText]}>
                Total Amount *
              </TextDefault>
            </View>
          </View>
          <View style={styles.valueRow}>
            <View style={styles.valueTextContainer}>
              <TextDefault style={[styles.text, styles.headerText]}>
                {isDreamGoldPlan
                  ? `${accountDetails?.schemeSummary?.schemaSummaryTransBalance?.insPaid || 0} / ${accountDetails?.schemeSummary?.instalment || 0}`
                  : `${productData.amountWeight?.Weight || 0} grams`}
              </TextDefault>
            </View>
            <View style={styles.valueTextContainer}>
              <TextDefault style={[styles.text, styles.headerText]}>
                {productData.amountWeight?.Amount || 0} ₹
              </TextDefault>
            </View>
          </View>
        </View>

        {/* Yellow Line Below Center Section */}
        <View style={styles.yellowLine} />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Circle Section */}
          <View style={styles.circleContainer}>
            <View style={styles.weightCircle}>
              <TextDefault style={styles.weightText}>
                {isDreamGoldPlan ? 'Amount Saved' : 'Weight Saved'}
              </TextDefault>
              <TextDefault style={styles.weightValue}>
                {isDreamGoldPlan
                  ? `₹${accountDetails?.schemeSummary?.schemaSummaryTransBalance?.amtrecd || 0}`
                  : `${productData.amountWeight?.Weight || 0} grams`}
              </TextDefault>
            </View>
          </View>

          {/* Maturity Date Section */}
          <View style={styles.dateContainer}>
            <TextDefault style={styles.maturityText}>
              Date of Maturity
            </TextDefault>
            <TextDefault style={styles.dateText}>
              {formatDate(productData.maturityDate)}
            </TextDefault>
          </View>

          {/* Pay Button Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                navigation.navigate('ProductDescription', {
                  productData,
                  status,
                  accountDetails
                })
              }
            >
              <TextDefault style={styles.payButtonText}>View</TextDefault>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                navigation.navigate('Buy', {
                  productData,
                  status,
                  accountDetails,
                  isDreamGoldPlan
                })
              }
            >
              <TextDefault style={styles.payButtonText}>Pay</TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    margin: scale(5),
    borderRadius: scale(15),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  gradientBackground: {
    borderRadius: scale(15),
    padding: scale(5)
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(20),
    ...alignment.Psmall
  },
  rightTop: {
    alignItems: 'flex-end'
  },
  statusContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: scale(-30),
    marginRight: scale(10)
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginLeft: scale(5)
  },
  centerSection: {
    paddingVertical: scale(15),
    borderRadius: scale(5),
    marginBottom: scale(5),
    ...alignment.PxSmall
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(5)
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center'
  },
  valueTextContainer: {
    flex: 1,
    alignItems: 'center'
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...alignment.PxSmall
  },
  circleContainer: {
    alignItems: 'center'
  },
  weightCircle: {
    width: scale(75),
    height: scale(75),
    borderRadius: scale(70),
    backgroundColor: colors.radioColor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(10),
    borderWidth: 5,
    borderColor: '#eab308'
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: scale(10),
    alignItems: 'center'
  },
  maturityText: {
    color: colors.greenColor,
    fontSize: scale(12),
    textAlign: 'center',
    fontWeight: 'bold'
  },
  dateText: {
    color: colors.greenColor,
    fontSize: scale(10),
    marginTop: scale(2),
    textAlign: 'center',
    fontWeight: 'bold'
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: scale(10),
    flexDirection: 'row',
    gap: 10
  },
  payButton: {
    backgroundColor: colors.white,
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: scale(10)
  },
  text: {
    color: colors.greenColor,
    fontSize: scale(12),
    fontWeight: 'bold'
  },
  bold: {
    fontWeight: 'bold'
  },
  weightText: {
    color: colors.fontMainColor,
    fontSize: scale(7),
    textAlign: 'center',
    fontWeight: 'bold'
  },
  weightValue: {
    color: colors.fontMainColor,
    fontSize: scale(8),
    fontWeight: 'bold',
    textAlign: 'center'
  },
  payButtonText: {
    color: colors.fontMainColor,
    fontSize: 12,
    fontWeight: 'bold'
  },
  yellowLine: {
    height: scale(2),
    backgroundColor: colors.greenColor,
    borderRadius: scale(1),
    marginBottom: scale(10)
  },
  accountDetailsSection: {
    padding: scale(10),
    backgroundColor: colors.lightGray,
    borderRadius: scale(5),
    marginBottom: scale(10)
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(5)
  },
  detailLabel: {
    color: colors.fontMainColor,
    fontSize: scale(12)
  },
  detailValue: {
    color: colors.fontSecondColor,
    fontSize: scale(12),
    fontWeight: '600'
  }
})

export default ProductCard
