import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale, verticalScale } from '../../utils/scaling';


// BMG Jewellers specific colors
const bmgColors = {
  primary: '#D4AF37', // Gold primary color
  primaryDark: '#B8860B', // Dark gold
  primaryLight: '#FFD700', // Light gold
  secondary: '#000000', // Black
  accent: '#8B4513', // SaddleBrown for contrast
  background: '#FFF9E6', // Light gold background
  card: '#FFFFFF', // White cards
  textPrimary: '#2C2C2C', // Dark text
  textSecondary: '#555555', // Medium text
  textLight: '#FFFFFF', // White text
  border: '#E6D3CA', // Light gold border
};

const { width } = Dimensions.get('window');

const PrivacyPolicyPage = () => {
  const handleExternalLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const policySections = [
    {
      title: "Information We Collect",
      icon: "person",
      content: "Personal identification details (name, email, phone number, etc.), device information and browsing history, location and IP address."
    },
    {
      title: "How We Use Your Data",
      icon: "data-usage",
      content: "To improve our services and personalize your experience, to communicate offers, promotions, or important updates, for analytics and security enhancement."
    },
    {
      title: "What We Don't Do",
      icon: "block",
      content: "We do not sell your personal information. We do not track your location without consent."
    },
    {
      title: "Data Sharing",
      icon: "share",
      content: "",
      subsections: [
        {
          title: "We Do Not Share With",
          content: "Unaffiliated third parties, social media platforms"
        },
        {
          title: "We May Share With",
          content: "Trusted service providers, legal authorities (when required)"
        }
      ]
    },
    {
      title: "Security Note",
      icon: "security",
      content: "Your data is encrypted and securely stored as per industry standards. We employ the latest security measures to protect your information."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF9E6', '#FFEDCC']}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with BMG Logo */}
          <LinearGradient
            colors={[bmgColors.primary, bmgColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>BMG</Text>
              </View>
              <Text style={styles.logoSubtext}>Jewellers</Text>
            </View> */}
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
          </LinearGradient>

          {/* Introduction */}
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              At BMG Jewellers, we value your privacy and are committed to protecting your personal information. 
              This policy outlines how we collect, use, and safeguard your data.
            </Text>
          </View>

          {/* Policy Sections */}
          {policySections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Icon name={section.icon} size={24} color={bmgColors.primary} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <Text style={styles.sectionContent}>{section.content}</Text>
              
              {section.subsections && section.subsections.map((subsection, subIndex) => (
                <View key={subIndex} style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                  </View>
                  <Text style={styles.subsectionContent}>{subsection.content}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Icon name="verified-user" size={32} color={bmgColors.primary} />
            <Text style={styles.securityText}>Your Data is Protected with 256-bit Encryption</Text>
          </View>

          {/* Additional Information */}
          <View style={styles.additionalInfo}>
            <Text style={styles.infoTitle}>Additional Information</Text>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Icon name="language" size={20} color={bmgColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Website</Text>
                <TouchableOpacity onPress={() => handleExternalLink("https://bmgjewellers.com")}>
                  <Text style={styles.link}>https://bmgjewellers.com</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Icon name="support-agent" size={20} color={bmgColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Contact</Text>
                <Text style={styles.infoItemContent}>For privacy-related questions, please contact our support team at Contact@bmgjewellers.in</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Icon name="update" size={20} color={bmgColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Policy Updates</Text>
                <Text style={styles.infoItemContent}>We may update this policy periodically. Please check back for changes.</Text>
              </View>
            </View>
          </View>

          {/* Consent Footer */}
          <LinearGradient
            colors={[bmgColors.primary, bmgColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.consentFooter}
          >
            <Icon name="done-all" size={24} color={bmgColors.textLight} />
            <Text style={styles.consentText}>
              By using our services, you consent to our privacy policy.
            </Text>
          </LinearGradient>

          {/* Copyright */}
          <View style={styles.copyright}>
            <Text style={styles.copyrightText}>© {new Date().getFullYear()} BMG Jewellers. All rights reserved.</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bmgColors.background,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
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
    shadowRadius: 6,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },

  
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: bmgColors.textLight,
    marginBottom: verticalScale(5),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: scale(14),
    color: bmgColors.textLight,
    opacity: 0.9,
  },
  introCard: {
    backgroundColor: bmgColors.card,
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: bmgColors.primary,
  },
  introText: {
    fontSize: scale(16),
    color: bmgColors.textPrimary,
    lineHeight: verticalScale(24),
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: bmgColors.card,
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: bmgColors.border,
    paddingBottom: verticalScale(10),
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: bmgColors.primary,
    flex: 1,
  },
  sectionContent: {
    fontSize: scale(16),
    color: bmgColors.textPrimary,
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(10),
  },
  subsection: {
    marginTop: verticalScale(10),
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  bulletPoint: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: bmgColors.primary,
    marginRight: scale(10),
  },
  subsectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: bmgColors.primary,
  },
  subsectionContent: {
    fontSize: scale(16),
    color: bmgColors.textPrimary,
    lineHeight: verticalScale(24),
    paddingLeft: scale(16),
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: scale(15),
    padding: scale(15),
    marginHorizontal: scale(15),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: bmgColors.primaryLight,
  },
  securityText: {
    fontSize: scale(16),
    color: bmgColors.primaryDark,
    fontWeight: '600',
    marginLeft: scale(10),
    flex: 1,
  },
  additionalInfo: {
    backgroundColor: bmgColors.card,
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: bmgColors.primary,
    marginBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: bmgColors.border,
    paddingBottom: verticalScale(10),
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: verticalScale(15),
  },
  infoIcon: {
    width: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: bmgColors.primary,
    marginBottom: verticalScale(5),
  },
  infoItemContent: {
    fontSize: scale(16),
    color: bmgColors.textPrimary,
    lineHeight: verticalScale(24),
  },
  link: {
    fontSize: scale(16),
    color: bmgColors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  consentFooter: {
    borderRadius: scale(15),
    padding: scale(20),
    marginHorizontal: scale(15),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  consentText: {
    fontSize: scale(16),
    color: bmgColors.textLight,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: scale(10),
  },
  copyright: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    paddingHorizontal: scale(15),
  },
  copyrightText: {
    fontSize: scale(12),
    color: bmgColors.textSecondary,
    textAlign: 'center',
  },
});

export default PrivacyPolicyPage;