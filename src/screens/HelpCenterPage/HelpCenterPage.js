import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, scale, verticalScale } from '../../utils'
import { colors1 } from '../../utils/colors'

const { width } = Dimensions.get('window')
const SUPPORT_NUMBER = '919514333601' // ✅ Add your WhatsApp support number (with country code)

function HelpCenterPage() {
  const handlePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`)
  }

  const handleOpenMap = () => {
    const address =
      'M/s. BMG Jewellers Pvt Ltd, 160, Melamasi St, Madurai-625001'
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    Linking.openURL(url)
  }

  const handleWhatsApp = (message) => {
    const url = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`
    Linking.openURL(url).catch(() => {
      alert('Make sure WhatsApp is installed')
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={colors1.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>We're here to help you</Text>
        </LinearGradient>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          {/* Phone Numbers Card */}
          <LinearGradient
            colors={['#FFF9E6', '#FFEDCC']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.phoneIconContainer]}>
                <Icon name='phone' size={24} color={colors1.primary} />
              </View>
              <Text style={styles.cardTitle}>Phone Numbers</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall('919514333601')}
            >
              <Text style={styles.contactText}>+91-95143 33601</Text>
              <Icon name='call' size={20} color={colors1.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall('919514333609')}
            >
              <Text style={styles.contactText}>+91-95143 33609</Text>
              <Icon name='call' size={20} color={colors1.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Email Card */}
          <LinearGradient
            colors={['#FFF9E6', '#FFEDCC']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.emailIconContainer]}>
                <Icon name='email' size={24} color={colors1.primary} />
              </View>
              <Text style={styles.cardTitle}>Email Address</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleEmail('Contact@bmgjewellers.in')}
            >
              <Text style={styles.contactText}>Contact@bmgjewellers.in</Text>
              <Icon name='mail-outline' size={20} color={colors1.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Office Address Card */}
          <LinearGradient
            colors={['#FFF9E6', '#FFEDCC']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.iconContainer, styles.locationIconContainer]}
              >
                <Icon name='location-on' size={24} color={colors1.primary} />
              </View>
              <Text style={styles.cardTitle}>Office Address</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleOpenMap}
            >
              <View style={styles.addressContainer}>
                <Text style={styles.contactText}>
                  M/s. BMG Jewellers Pvt Ltd
                </Text>
                <Text style={styles.contactText}>
                  160, Melamasi St, Madurai-625001
                </Text>
              </View>
              <Icon name='place' size={20} color={colors1.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursTitle}>Customer Support Hours</Text>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Saturday</Text>
            <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Sunday</Text>
            <Text style={styles.hoursTime}>11:00 AM - 4:00 PM</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                handleWhatsApp('Hello! I need help via Live Chat.')
              }
            >
              <Icon name='chat' size={24} color={colors1.primary} />
              <Text style={styles.actionText}>Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleWhatsApp('I would like to see the FAQs.')}
            >
              <Icon name='help-outline' size={24} color={colors1.primary} />
              <Text style={styles.actionText}>FAQs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePhoneCall('919514333601')}
            >
              <Icon name='description' size={24} color={colors1.primary} />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: verticalScale(20) },
  header: {
    padding: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors1.textPrimary,
    marginBottom: verticalScale(5)
  },
  subtitle: {
    fontSize: scale(16),
    color: colors1.textLight,
    opacity: 0.9
  },
  cardsContainer: {
    paddingHorizontal: scale(15),
    marginBottom: verticalScale(20)
  },
  card: {
    borderRadius: scale(15),
    padding: scale(20),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(205, 134, 92, 0.2)',
    paddingBottom: verticalScale(10)
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10)
  },
  phoneIconContainer: { backgroundColor: 'rgba(205, 134, 92, 0.1)' },
  emailIconContainer: { backgroundColor: 'rgba(205, 134, 92, 0.1)' },
  locationIconContainer: { backgroundColor: 'rgba(205, 134, 92, 0.1)' },
  cardTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors1.primary
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(205, 134, 92, 0.1)'
  },
  contactText: {
    fontSize: scale(16),
    color: colors1.textPrimary,
    flex: 1,
    marginRight: scale(10)
  },
  addressContainer: { flex: 1 },
  hoursContainer: {
    backgroundColor: colors1.cardBackground,
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  hoursTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors1.primary,
    marginBottom: verticalScale(15),
    textAlign: 'center'
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(205, 134, 92, 0.1)'
  },
  hoursDay: {
    fontSize: scale(16),
    color: colors1.textPrimary,
    fontWeight: '500'
  },
  hoursTime: { fontSize: scale(16), color: colors1.primary, fontWeight: '600' },
  actionsContainer: {
    backgroundColor: colors1.cardBackground,
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  actionsTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors1.primary,
    marginBottom: verticalScale(15),
    textAlign: 'center'
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: {
    alignItems: 'center',
    padding: scale(10),
    backgroundColor: 'rgba(205, 134, 92, 0.1)',
    borderRadius: scale(10),
    width: width * 0.25
  },
  actionText: {
    fontSize: scale(12),
    color: colors1.primary,
    marginTop: verticalScale(5),
    textAlign: 'center'
  }
})

export default HelpCenterPage
