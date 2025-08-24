import React from 'react';
import { View, ScrollView, StyleSheet, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { scale } from '../../utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors1 } from '../../utils/colors';

function KnowMore() {
  const route = useRoute();
  const navigation = useNavigation();
  const { schemeId } = route.params || {};

  const DottedCircle = ({ iconName }) => (
    <View style={styles.dottedCircleContainer}>
      <View style={styles.dottedCircle}>
        <Icon name={iconName} size={scale(30)} color={colors1.primary} />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>DIGIGOLD SCHEME</Text>

        <Text style={styles.description}>
          Choose DigiGold because it offers a convenient and flexible way to save in gold through a mobile app, providing tiered benefits that allow users to earn additional gold weight on their savings. DigiGold is an ideal choice for customers seeking a secure and accessible investment in gold, with the option to redeem their savings for attractive gold jewellery at BMG Jewellers.
        </Text>

        <Text style={styles.sectionTitle}>Process to Join:</Text>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="account-plus" />
          <Text style={styles.description1}>Click "Join Now" On DigiGold Scheme</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="weight-kilogram" />
          <Text style={styles.description1}>Enter Amount/Weight you wish to start with</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="credit-card-outline" />
          <Text style={styles.description1}>Make Payment Using Any Mode</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="target" />
          <Text style={styles.description1}>Set Saving Target (Optional)</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="check-circle-outline" />
          <Text style={styles.description1}>Continue Your Savings</Text>
        </View>

        <Text style={styles.sectionTitle}>Process to Redeem:</Text>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="storefront-outline" />
          <Text style={styles.description1}>Visit BMG Jewellery</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="form-select" />
          <Text style={styles.description1}>Submit Redemption Request Form</Text>
        </View>
        <View style={styles.stepContainerWithCircle}>
          <DottedCircle iconName="diamond-outline" />
          <Text style={styles.description1}>Choose Jewel</Text>
        </View>

        <Text style={styles.sectionTitle}>Features & Benefits:</Text>
        <Text style={styles.subHeading}>Minimum Amount:</Text>
        <Text style={styles.description}>
          The minimum amount that can be saved in gold is Rs. 100. Users can save any amount above Rs. 100 at any time during the first 330 days from the date of the first payment.
        </Text>

        <Text style={styles.subHeading}>Scheme Period:</Text>
        <Text style={styles.description}>
          The scheme period of 330 days will begin on the date of the first payment made. During this period, users can save in gold any number of times. On the 330th day from the date of enrolment, the scheme will mature.
        </Text>

        <Text style={styles.subHeading}>Benefits:</Text>
        <Text style={styles.description}>
          Users will be eligible for benefits on the gold weight being saved in their account, as per the following slab system:
        </Text>
        <Text style={styles.description}>First 75 days - 5% benefit</Text>
        <Text style={styles.description}>76th to 150th Days - 3.75% benefit</Text>
        <Text style={styles.description}>151st to 225th Days - 2% benefit</Text>
        <Text style={styles.description}>226th to 300th Days - 0.75% benefit</Text>
        <Text style={styles.description}>
          Please note that no benefits will be offered for payments made during the final 30 days of the scheme period (i.e., 301st day to 330th day). Benefits will only be offered if the user redeems their account after maturity; otherwise, the benefit gold weight will not be offered.
        </Text>

        <Text style={styles.subHeading}>Redemption:</Text>
        <Text style={styles.description}>
          Saved gold weight can be redeemed and purchased as gold jewellery at any of BMG stores located across Tamil Nadu or online by sending an email to digigoldsupport@bmg.com. Users must pay for GST and any value-added charges such as wastage charges, marking charges, stone charges, and hallmark charges, if applicable.
        </Text>
        <Text style={styles.description}>
          There is a minimum lock-in period of 30 days, during which users cannot redeem their savings. Only the person whose name was used at the time of registration can redeem the scheme, and they must submit original identification proof such as Aadhaar, PAN, driving license, or voter ID at the time of redemption. Users must redeem their scheme within 35 days from the date of maturity.
        </Text>

        <Text style={styles.subHeading}>Refunds:</Text>
        <Text style={styles.description}>
          The paid amount will not be refunded under any circumstances. This means that if the customer changes their mind after enrolling in the scheme and decides not to redeem the gold, they will not be able to get a refund of the amount paid.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddNewMember', { schemeId })}>
            <Text style={styles.buttonText}>Join Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('MainLanding')}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(15),
    backgroundColor: 'rgba(255, 249, 246, 0.9)',
  },
  backgroundImage: {
    flex: 1,
  },
  title: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors1.primary,
    marginBottom: scale(10),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: scale(14),
    color: colors1.textPrimary,
    marginBottom: scale(15),
    lineHeight: scale(20),
  },
  description1: {
    fontSize: scale(14),
    color: colors1.textPrimary,
    marginBottom: scale(3),
    flex: 1,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors1.primary,
    marginVertical: scale(10),
    textDecorationLine: 'underline',
  },
  subHeading: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: colors1.primary,
    marginVertical: scale(5),
    textDecorationLine: 'underline',
  },
  stepContainerWithCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  dottedCircleContainer: {
    marginRight: scale(10),
  },
  dottedCircle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: scale(1),
    borderColor: colors1.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors1.sectionBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scale(20),
    gap: 30,
  },
  button: {
    backgroundColor: colors1.primary,
    paddingVertical: scale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(8),
    elevation: 3,
  },
  closeButton: {
    backgroundColor: colors1.buttonSecondary,
    paddingVertical: scale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors1.primary,
    elevation: 2,
  },
  buttonText: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: colors1.buttonText,
    textAlign: 'center',
  },
  closeButtonText: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: colors1.primary,
    textAlign: 'center',
  },
});

export default KnowMore;