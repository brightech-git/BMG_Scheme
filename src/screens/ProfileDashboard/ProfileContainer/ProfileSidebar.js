import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  ScrollView,
  ImageBackground,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextDefault } from '../../../components';
import { colors } from '../../../utils';
import { colors1 } from '../../../utils/colors';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8; // Sidebar takes 80% of screen width

function ProfileSidebar(props) {
  const navigation = useNavigation();
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
        if (phoneNumber) {
          // Format the phone number for display
          const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
          setUserPhone(formattedPhone);
          
          // Fetch user details using phone number
          const response = await fetch(`https://akj.brightechsoftware.com/v1/api/account/phonesearch?phoneNo=${phoneNumber}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setUserName(data[0].pname || 'User');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [isSidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout canceled'),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('mpin');
              await AsyncStorage.removeItem('isMpinCreated');
              await AsyncStorage.removeItem('userPhoneNumber');
              navigation.replace('OTP');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header Section with Menu Icon */}
          <View style={styles.topHeaderSection}>
            <TouchableOpacity style={styles.faqIconContainer}>
              <Ionicons name="help" size={22} color={colors1.primaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuIconContainer}
              onPress={toggleSidebar}
            >
              <Ionicons name="menu" size={26} color={colors1.primaryText} />
            </TouchableOpacity>
          </View>

          {/* Rest of your content */}
          {/* ... */}
        </ScrollView>
      </SafeAreaView>

      {/* Sidebar Overlay */}
      {isSidebarVisible && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      
      {/* Sidebar Content */}
      <Animated.View 
        style={[
          styles.sidebarContainer,
          {
            transform: [{ translateX: slideAnim }],
            width: SIDEBAR_WIDTH
          }
        ]}
      >
        <SafeAreaView style={styles.sidebarSafeArea}>
          <ScrollView 
            style={styles.sidebarScrollView}
            contentContainerStyle={styles.sidebarScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.sidebarCloseButton}
              onPress={closeSidebar}
            >
              <Ionicons name="close" size={24} color={colors1.primaryText} />
            </TouchableOpacity>

            {/* Profile Header with Gradient */}
            <LinearGradient
              colors={colors1.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileHeader}
            >
              <View style={styles.profileSection}>
                <View style={styles.profileIconContainer}>
                  <LinearGradient
                    colors={['#FFD700', '#d43737ff']}
                    style={styles.profileIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="account-circle" size={80} color={colors1.textLight} />
                  </LinearGradient>
                </View>
                <TextDefault style={styles.profileName} H4>
                  {userName}
                </TextDefault>
                <View style={styles.phoneContainer}>
                  <Feather name="phone" size={20} color={colors1.textLight} style={styles.phoneIcon} />
                  <TextDefault style={styles.phoneNumber} H5>
                    {userPhone}
                  </TextDefault>
                </View>
              </View>
            </LinearGradient>

            {/* Settings Options Card */}
            <View style={styles.settingsCard}>
              <TextDefault style={styles.settingsTitle} H4>
                Account Settings
              </TextDefault>
              
              {[ 
                { label: 'My Scheme', icon: 'list', route: 'MyScheme' },
                { label: 'Help Center', icon: 'help-center', route: 'HelpCenter' },
                { label: 'Privacy Policy', icon: 'privacy-tip', route: 'PrivacyPolicy' },
                { label: 'Terms and Conditions', icon: 'description', route: 'TermsandCondition' },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.settingsItem}
                  onPress={() => {
                    navigation.navigate(item.route);
                    closeSidebar();
                  }}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIconContainer}>
                      <MaterialIcons name={item.icon} size={22} color={colors1.primary} />
                    </View>
                    <TextDefault style={styles.settingsItemText} H5>
                      {item.label}
                    </TextDefault>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors1.primary}
                  />
                </TouchableOpacity>
              ))}

              {/* Logout Option */}
              <TouchableOpacity
                style={[styles.settingsItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIconContainer, styles.logoutIconContainer]}>
                    <MaterialIcons name="logout" size={22} color={colors1.error} />
                  </View>
                  <TextDefault style={[styles.settingsItemText, styles.logoutText]} H5>
                    Log Out
                  </TextDefault>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors1.error}
                />
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View style={styles.versionContainer}>
              <TextDefault style={styles.versionText} H6>
                Version 1.0.0
              </TextDefault>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

export default ProfileSidebar;