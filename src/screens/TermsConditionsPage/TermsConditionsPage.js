import React from 'react';
import { ScrollView, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { TextDefault } from '../../components';
import { scale } from '../../utils';

// Your color palette
const colors1 = {
  // Base tones
  primary: '#CD865C',          // Main brand/base color
  primaryDark: '#B35F34',      // Darker shade for hover/pressed
  primaryLight: '#E8B79D',     // Lighter shade for highlights

  // Text colors
  textPrimary: '#000000ff',    // Main text
  primaryText: '#041f60',      // Primary text color
  textSecondary: '#555555',    // Secondary/subtitle text
  textLight: '#FFFFFF',        // Light text on dark backgrounds

  // Backgrounds
  background: '#FFF9F6',       // Page background (light warm)
  cardBackground: '#FFFFFF',   // Card or container
  sectionBackground: '#FBEFE9',// Section or block backgrounds
  headerBackground: '#f58747b6', // Headers/Top bars

  // Buttons
  buttonPrimary: '#CD865C',    
  buttonPrimaryHover: '#B35F34',
  buttonSecondary: '#FFFFFF',
  buttonText: '#FFFFFF',

  // Borders and lines
  borderLight: '#E6D3CA',
  borderDark: '#B35F34',

  // Alerts & Status
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Icons
  iconPrimary: '#CD865C',
  iconSecondary: '#555555',

  // Gradients
  gradientPrimary: ['#CD865C', '#B35F34'], // React Native
  gradientSecondary: ['#E8B79D', '#CD865C'],
  gradientText: ['#31063a', '#ff2b59'],
  gradientBackground: "linear-gradient(135deg, #CD865C, #B35F34)", // Web CSS

  // Additional accents
  accent: '#FFB699',
  highlight: '#FFD1B3'
};

const TermsConditionsPage = () => {
  const termsData = [
    {
      title: "1. Product Representation",
      content: [
        "Images are for reference only. Minor variations in color or finish may occur.",
        "All products are handcrafted, so slight irregularities are natural.",
        "For exact details, contact us before ordering."
      ]
    },
    {
      title: "2. Pricing",
      subtitle: "Currency & Taxes",
      content: [
        "All prices are in INR and inclusive of GST"
      ],
      subsections: [
        {
          title: "Price Changes",
          content: [
            "Prices may change without prior notice",
            "Final amount charged will be as displayed at checkout."
          ]
        }
      ]
    },
    {
      title: "3. Payments",
      content: [
        "We accept:",
        "• Online Payments",
        "• UPI",
        "• Debit/Credit Cards",
        "• Net Banking",
        "• Cash on Delivery (Selected PIN codes only)",
        "• ₹50 COD fee may apply"
      ]
    },
    {
      title: "4. Product Use & Care",
      content: [
        "Handle gold-polished jewellery with care. Avoid water & chemicals.",
        "Store in a dry pouch when not in use.",
        "No guarantee for polish durability; depends on usage.",
        "Ask us for maintenance tips to extend product life."
      ]
    },
    {
      title: "5. Limitation of Liability",
      content: [
        "We are not liable for:",
        "• Shipping delays or damage",
        "• Force majeure events",
        "• Improper use or care"
      ]
    },
    {
      title: "6. Intellectual Property",
      content: [
        "All content is © and the property of our brand. No part may be:",
        "• Copied or redistributed without permission",
        "• Used commercially",
        "• Altered or modified"
      ]
    },
    {
      title: "7. Governing Law",
      content: [
        "These terms are governed by Indian law.",
        "Disputes will be settled in Madurai, Tamil Nadu.",
        "Contact us before placing orders if you have any questions."
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* <ImageBackground 
        source={require('../../assets/Terms-and-Conditionspage.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      > */}
        <View style={styles.overlay} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TextDefault style={styles.title}>Terms & Conditions</TextDefault>
            <View style={styles.titleUnderline} />
          </View>
          
          <View style={styles.contentContainer}>
            {termsData.map((section, index) => (
              <View key={index} style={styles.section}>
                <TextDefault style={styles.sectionTitle}>{section.title}</TextDefault>
                
                {section.subtitle && (
                  <TextDefault style={styles.subtitle}>{section.subtitle}</TextDefault>
                )}
                
                {section.content.map((point, pointIndex) => (
                  <View key={pointIndex} style={styles.pointContainer}>
                    <View style={styles.bullet} />
                    <TextDefault style={styles.pointText}>{point}</TextDefault>
                  </View>
                ))}
                
                {section.subsections && section.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <TextDefault style={styles.subsectionTitle}>{subsection.title}</TextDefault>
                    {subsection.content.map((point, pointIndex) => (
                      <View key={pointIndex} style={styles.pointContainer}>
                        <View style={styles.bullet} />
                        <TextDefault style={styles.pointText}>{point}</TextDefault>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
            
            <View style={styles.footer}>
              <TextDefault style={styles.lastUpdated}>Last Updated: 23 August 2025</TextDefault>
            </View>
          </View>
        </ScrollView>
      {/* </ImageBackground> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 249, 246, 0.92)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: scale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(30),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: colors1.primaryText,
    textAlign: 'center',
    marginBottom: scale(10),
  },
  titleUnderline: {
    width: scale(80),
    height: scale(4),
    backgroundColor: colors1.primary,
    borderRadius: scale(2),
  },
  contentContainer: {
    backgroundColor: colors1.cardBackground,
    borderRadius: scale(16),
    padding: scale(20),
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  section: {
    marginBottom: scale(25),
    borderLeftWidth: scale(3),
    borderLeftColor: colors1.primaryLight,
    paddingLeft: scale(15),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors1.primary,
    marginBottom: scale(8),
  },
  subtitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors1.primaryDark,
    marginBottom: scale(8),
  },
  subsection: {
    marginLeft: scale(15),
    marginTop: scale(10),
  },
  subsectionTitle: {
    fontSize: scale(15),
    fontWeight: '600',
    color: colors1.textSecondary,
    marginBottom: scale(5),
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scale(6),
  },
  bullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: colors1.primary,
    marginRight: scale(10),
    marginTop: scale(8),
  },
  pointText: {
    flex: 1,
    fontSize: scale(14),
    color: colors1.textSecondary,
    lineHeight: scale(20),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors1.borderLight,
    paddingTop: scale(20),
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: scale(12),
    color: colors1.textSecondary,
    fontStyle: 'italic',
  },
});

export default TermsConditionsPage;