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
import {
  getHash,
  startOtpListener,
  useOtpVerify,
  removeListener,
} from "react-native-otp-verify";
import { showToast } from "../../utils/toast";
import appTheme from "../../utils/Theme";
import styles from "./OtpStyles.js";
import userService from "../../services/UserService";

const { COLORS } = appTheme;

function OtpPage({ navigation, route }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [autoCompleteOtp, setAutoCompleteOtp] = useState("");
  const [appHash, setAppHash] = useState([]);
  const inputRefs = useRef([]);
  
  const phoneNumber = route.params?.phoneNumber || "";

  // Use the OTP verification hook
  const {
    hash,
    otp: hookOtp,
    message,
    timeoutError,
    stopListener,
    startListener,
  } = useOtpVerify({ numberOfDigits: 6 });

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Auto-verify when manual OTP is complete
  useEffect(() => {
    if (otp.join("").length === 6) {
      console.log("OTP completed, auto-verifying:", otp.join(""));
      handleVerifyOtp();
    }
  }, [otp]);

  // Handle OTP from SMS using react-native-otp-verify hook
  useEffect(() => {
    if (hookOtp && hookOtp.length === 6) {
      console.log("Hook OTP detected:", hookOtp);

      // Update both states
      setAutoCompleteOtp(hookOtp);
      const otpArray = hookOtp.split("");
      setOtp(otpArray);

      showToast("OTP detected from SMS automatically!");

      // Auto-verify if all 6 digits are detected
      setTimeout(() => {
        handleVerifyOtp();
      }, 500);
    }
  }, [hookOtp]);

  // Enhanced OTP detection from SMS message
  const detectOtpFromMessage = (smsMessage) => {
    if (!smsMessage) return null;

    console.log("Analyzing SMS message for OTP:", smsMessage);

    // Multiple OTP patterns to try (in order of priority)
    const patterns = [
      /(?:otp|OTP)[\s:]*is[\s:]*(\d{6})/i, // "Your otp is 456789"
      /(?:otp|OTP)[\s:]*(\d{6})/i, // "OTP: 123456"
      /(?:code|CODE)[\s:]*(\d{6})/i, // "Code: 123456"
      /\b(\d{6})\b/, // 6 consecutive digits
      /(\d{6})[\s\n]*Pw9NWl4kidf/, // Your specific hash pattern
    ];

    for (const pattern of patterns) {
      const match = smsMessage.match(pattern);
      if (match) {
        // Return the OTP (might be in capture group 1 or the full match)
        const detected = match[1] || match[0];
        console.log("Pattern matched:", pattern, "OTP found:", detected);
        return detected;
      }
    }

    return null;
  };

  // Handle SMS message detection
  useEffect(() => {
    if (message) {
      console.log("SMS message received:", message);

      const detectedOtp = detectOtpFromMessage(message);
      if (detectedOtp && detectedOtp.length === 6) {
        console.log("OTP detected via function:", detectedOtp);

        // Update the auto-complete field
        setAutoCompleteOtp(detectedOtp);

        // Also update the manual OTP fields
        const otpArray = detectedOtp.split("");
        setOtp(otpArray);

        showToast("OTP detected automatically!");

        // Auto-verify
        setTimeout(() => {
          if (detectedOtp.length === 6) {
            handleVerifyOtp();
          }
        }, 1000);
      } else {
        console.log("No valid OTP detected in message");
      }
    }
  }, [message]);

  // Handle timeout error
  useEffect(() => {
    if (timeoutError) {
      console.log("SMS listener timeout");
      showToast("SMS listener timeout. Please enter OTP manually.");
    }
  }, [timeoutError]);

  // Get app hash on component mount
  useEffect(() => {
    initializeSMSListener();
    return () => {
      // Cleanup SMS listeners
      try {
        removeListener();
        if (stopListener) stopListener();
      } catch (error) {
        console.log("Error cleaning up SMS listeners:", error);
      }
    };
  }, []);

  // Initialize SMS listener and get app hash
  const initializeSMSListener = async () => {
    try {
      if (Platform.OS === "android") {
        // Get app hash for SMS verification
        const hashCodes = await getHash();
        setAppHash(hashCodes);
        console.log("App Hash Codes:", hashCodes);

        // You should display this hash to your SMS provider/backend
        if (hashCodes && hashCodes.length > 0) {
          console.log("Add this hash to your SMS format:", hashCodes[0]);
        }
      }
    } catch (error) {
      console.error("Error initializing SMS listener:", error);
    }
  };

  // Start SMS listener on mount (since this is always OTP mode)
  useEffect(() => {
    if (Platform.OS === "android") {
      try {
        console.log("Starting SMS listener for OTP screen");
        // Start the listener using the hook's method
        if (startListener) {
          startListener();
        }
      } catch (error) {
        console.error("Error starting SMS listener:", error);
      }
    }

    // Cleanup on unmount
    return () => {
      try {
        if (stopListener) {
          stopListener();
        }
      } catch (error) {
        console.log("Error in cleanup:", error);
      }
    };
  }, [startListener, stopListener]);

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
      // Clear OTP on failure
      setOtp(["", "", "", "", "", ""]);
      setAutoCompleteOtp("");
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
      // Clear OTP
      setOtp(["", "", "", "", "", ""]);
      setAutoCompleteOtp("");

      // Restart SMS listener
      try {
        if (startListener) {
          startListener();
        }
      } catch (error) {
        console.log("Error restarting listener:", error);
      }
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

  // Clear OTP function
  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setAutoCompleteOtp("");
    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
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

                {/* Debug Info (remove in production) */}
                {__DEV__ && (
                  <View style={{ padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 10 }}>
                    <Text style={{ color: 'white', fontSize: 12 }}>
                      Detected OTP: {autoCompleteOtp || "None"}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 12 }}>
                      OTP Array: {otp.join("") || "Empty"}
                    </Text>
                  </View>
                )}

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

                {/* Clear OTP Button */}
                <TouchableOpacity
                  style={{ alignSelf: 'center', marginVertical: 10 }}
                  onPress={clearOtp}
                >
                  <Text style={{ color: COLORS.primary, fontSize: 14 }}>Clear OTP</Text>
                </TouchableOpacity>

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