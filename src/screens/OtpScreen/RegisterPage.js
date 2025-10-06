import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../../utils/toast";
import appTheme from "../../utils/Theme";
import styles from './RegisterStyles'
import userService from "../../services/UserService";

const { COLORS } = appTheme;

function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhone(cleaned);
      setIsPhoneValid(/^[6-9]\d{9}$/.test(cleaned) || cleaned.length === 0);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !phone || !password) {
      return showToast("Please fill in all fields");
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return showToast("Enter a valid 10-digit Indian mobile number");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showToast("Enter a valid email address");
    }

    setLoading(true);
    const res = await userService.registerUser({ 
      username, 
      email, 
      contactNumber: phone, 
      password ,
       hashKey:"d4riq2SwBaq"
    });

    if (res.success) {
      // 🔹 Save full user data for resend OTP
      await AsyncStorage.setItem("tempUserData", JSON.stringify({
        username,
        email,
        phone,
        password
      }));
      showToast("Registration successful! OTP sent.");
      navigation.navigate("OTP", { phoneNumber: phone });
    } else {
      if (res.error?.toLowerCase().includes("contact number already exists")) {
        Alert.alert(
          "Number Already Registered",
          "This phone number is already registered. Would you like to login instead?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Login", 
              onPress: () => navigation.navigate("LoginPage", { prefillPhone: phone }) 
            }
          ]
        );
      } else if (res.error?.toLowerCase().includes("email already exists")) {
        showToast("This email is already registered. Please use another email.");
        setEmail("");
      } else {
        showToast(res.error || "Registration failed");
      }
    }
    setLoading(false);
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
                <Image source={require("../../assets/image/logo4.png")} style={styles.logoImage} />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Register</Text>
                <Text style={styles.subtitle}>Create a new account</Text>

                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.label}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Mobile Number</Text>
                <View style={[styles.inputContainer, !isPhoneValid && styles.inputError]}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={COLORS.textLight}
                    maxLength={10}
                    keyboardType="phone-pad"
                  />
                </View>
                {!isPhoneValid && phone.length > 0 && (
                  <Text style={styles.errorText}>Please enter a valid mobile number</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ["#555", "#444"] : [COLORS.gradientcolor7, COLORS.gradientcolor8]}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.black} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Register</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={navigateToLogin} style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Text style={styles.linkText}>Already have an account? </Text><Text style={styles.linkText1}> Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default RegisterPage;
