import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { TextDefault } from '../../components';
import { alignment } from '../../utils';
import { colors1 } from '../../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../../utils/toast';

function OTP({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Timer for resend OTP
  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handlePhoneChange = (text) => {
    const cleanedText = text.replace(/\D/g, '');
    if (cleanedText.length <= 10) {
      setPhoneNumber(cleanedText);
      setIsPhoneValid(/^[6-9]\d{9}$/.test(cleanedText) || cleanedText.length === 0);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      showToast('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtp(['', '', '', '']);
    setLoading(true);

    try {
      // Using TextSpeed SMS gateway
      const smsApiUrl = `https://sms.textspeed.in/vb/apikey.php`;
      const params = new URLSearchParams({
        apikey: "dYU7ULuItj9iZQWM",
        senderid: "BMGJEW",
        templateid: "1707174840853673783",
        number: `91${phoneNumber}`,
        message: `Welcome ${phoneNumber}! Do not share the OTP below with anyone. Your OTP is ${otp} to verify your phone number. This code is valid for 5 minutes.BMG JEWELLERS PRIVATE LIMITED`,
      });

      const fullUrl = `${smsApiUrl}?${params}`;
      console.log('SMS API URL:', fullUrl);
      console.log('Generated OTP:', otp);
      console.log('Phone number:', phoneNumber);

      const response = await fetch(fullUrl);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed response:', result);
      } catch (e) {
        console.log('Response is not JSON:', responseText);
        result = { status: "Error", description: "Invalid response from server" };
      }

      if (response.ok && result.status === "Success") {
        console.log('SMS sent successfully');
        showToast('OTP sent successfully!');
        try {
          await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
        } catch (storageError) {
          console.error('Failed to save phone number:', storageError);
        }
        setIsOtpVisible(true);
        setResendTimer(30); // Set 30 seconds timer for resend
      } else {
        const errorMsg = result.description || 'Failed to send OTP. Please try again.';
        console.log('SMS sending failed:', errorMsg);
        showToast(errorMsg);
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      showToast('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join('') === generatedOtp) {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
        
        const response = await fetch(`https://akj.brightechsoftware.com/v1/api/account/phonesearch?phoneNo=${storedPhoneNumber}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            await AsyncStorage.setItem('userName', data[0].pname || 'User');
          }
        }

        await AsyncStorage.setItem('isOtpVerified', 'true');
        await AsyncStorage.removeItem('mpin');
        await AsyncStorage.removeItem('isMpinCreated');
        navigation.navigate('MpinScreen', { step: 3 });
      } catch (error) {
        showToast('Failed to save user details. Please try again.');
        console.error(error);
      }
    } else {
      showToast('Invalid OTP. Please try again.');
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(255, 249, 246, 0.95)', 'rgba(251, 239, 233, 0.95)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo2.png')}
              style={styles.logoImage}
            />
          </View>

          {/* Content Card */}
          <LinearGradient
            colors={['#FFFFFF', '#FBEFE9']}
            style={styles.card}
          >
            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {!isOtpVisible && (
              <>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={[styles.inputContainer, !isPhoneValid && styles.inputError]}>
                  <View style={styles.phoneInputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor={colors1.textSecondary}
                      maxLength={10}
                    />
                  </View>
                </View>
                {!isPhoneValid && phoneNumber.length > 0 && (
                  <Text style={styles.errorText}>Please enter a valid 10-digit mobile number</Text>
                )}

                <TouchableOpacity 
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleSendOtp}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#cccccc', '#bbbbbb'] : colors1.gradientPrimary}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {isOtpVisible && (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>Sent to +91 {phoneNumber}</Text>
                
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <LinearGradient
                      key={index}
                      colors={digit ? colors1.gradientPrimary : ['#FFFFFF', '#F7F7F7']}
                      style={styles.otpInputWrapper}
                    >
                      <TextInput
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        textAlign="center"
                        selectionColor={colors1.primary}
                      />
                    </LinearGradient>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors1.gradientPrimary}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendContainer}
                  onPress={resendTimer === 0 ? handleSendOtp : null}
                  disabled={resendTimer > 0}
                >
                  <Text style={styles.resendText}>Didn't receive OTP? </Text>
                  <Text style={[styles.resendLink, resendTimer > 0 && styles.resendDisabled]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resendDisabled: {
    opacity: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    marginTop: -120,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors1.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors1.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  otpSubtitle: {
    fontSize: 14,
    color: colors1.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors1.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors1.borderLight,
    paddingHorizontal: 16,
    height: 60,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.textPrimary,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors1.textPrimary,
    height: '100%',
  },
  inputError: {
    borderColor: colors1.error,
  },
  errorText: {
    color: colors1.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInputWrapper: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors1.borderLight,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors1.textPrimary,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 60,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors1.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: colors1.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: colors1.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OTP;