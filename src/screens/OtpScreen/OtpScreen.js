import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../../utils/toast";
import appTheme from "../../utils/Theme";
import styles from "./OtpStyles.js";
import userService from "../../services/UserService";

const { COLORS } = appTheme;

function OtpPage({ navigation, route }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);
  
  const phoneNumber = route.params?.phoneNumber || "";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (val, idx) => {
    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);
    
    if (val && idx < otp.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return showToast("Please enter 6-digit OTP");
    }

    setVerifying(true);
    const tempUserData = await AsyncStorage.getItem("tempUserData");
    
    if (!tempUserData) {
      showToast("User data not found. Please try registering again.");
      setVerifying(false);
      return;
    }

    const { phone } = JSON.parse(tempUserData);

    const res = await userService.verifyOtp(phone, otpValue);

    if (res.success) {
      showToast("OTP verified successfully!");
      await AsyncStorage.removeItem("tempUserData");
      navigation.navigate("LoginPage");
    } else {
      showToast(res.error || "OTP verification failed");
    }
    setVerifying(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const tempUserData = await AsyncStorage.getItem("tempUserData");
    if (!tempUserData) {
      return showToast("User data not found. Please try registering again.");
    }

    const { username, email, phone, password } = JSON.parse(tempUserData);

    const res = await userService.registerUser({
      username,
      email,
      contactNumber: phone,
      password,
    });

    if (res.success) {
      showToast("OTP resent successfully!");
      setResendTimer(30);
    } else {
      showToast(res.error || "Failed to resend OTP");
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("LoginPage");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ImageBackground 
        source={require("../../assets/bg4.jpg")} 
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image source={require("../../assets/logo2.png")} style={styles.logoImage} />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                  Enter the 6-digit OTP sent to{"\n"}+91 {phoneNumber}
                </Text>

                {/* Manual OTP Input */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <LinearGradient
                      key={index}
                      colors={digit ? [COLORS.gradientcolor7, COLORS.gradientcolor8] : [COLORS.background, COLORS.background]}
                      style={styles.otpInputWrapper}
                    >
                      <TextInput
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        textAlign="center"
                        selectionColor={COLORS.primary}
                      />
                    </LinearGradient>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, verifying && styles.disabledButton]}
                  onPress={handleVerifyOtp}
                  disabled={verifying}
                >
                  <LinearGradient
                    colors={verifying ? ["#555", "#444"] : [COLORS.gradientcolor7, COLORS.gradientcolor8]}
                    style={styles.buttonGradient}
                  >
                    {verifying ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Verify OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendContainer}
                  onPress={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  <Text style={styles.resendText}>Didn't receive OTP? </Text>
                  <Text style={[styles.resendLink, resendTimer > 0 && styles.resendDisabled]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={navigateToLogin} style={styles.linkContainer}>
                  <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default OtpPage;
