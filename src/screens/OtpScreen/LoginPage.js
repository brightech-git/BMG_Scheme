import React, { useState, useEffect } from "react";
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
import styles from "./LoginStyles.js";
import userService from "../../services/UserService";
import { useNavigation } from "@react-navigation/native";

const { COLORS } = appTheme;

function LoginPage({ route }) {
  const [contactOrEmailOrUsername, setContactOrEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.prefillPhone) {
      setContactOrEmailOrUsername(route.params.prefillPhone);
    }
  }, [route.params?.prefillPhone]);

  const handleLogin = async () => {
    if (!contactOrEmailOrUsername || !password) {
      return showToast("Please enter email/username and password");
    }

    setLoading(true);
    try {
      const res = await userService.loginUser({
        contactOrEmailOrUsername,
        password,
      });

      if (res.success && res.data?.token) {
        const data = res.data;
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("userId", String(data.id));
        await AsyncStorage.setItem("userEmail", data.email);
        await AsyncStorage.setItem("userName", data.username);
        await AsyncStorage.setItem("userPhoneNumber", data.contact);
        await AsyncStorage.setItem("userData", JSON.stringify(data));

        showToast("Login successful!");
        navigation.navigate("MpinScreen", { step: 3 });
      } else {
        showToast(res.error || "Invalid credentials");
      }
    } catch (err) {
      showToast(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("RegisterPage");
  };
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ImageBackground source={require("../../assets/bg4.jpg")} style={styles.backgroundImage}>
      {/* <LinearGradient
        colors={
          loading
            ? ["#555", "#444"]
            : [COLORS.gradientcolor7, COLORS.gradientcolor8]
        }
        style={styles.backgroundImage}
      > */}
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
                <Image
                  source={require("../../assets/image/logo4.png")}
                  style={styles.logoImage}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <Text style={styles.label}>Email or Phone</Text>
                <TextInput
                  style={styles.input}
                  value={contactOrEmailOrUsername}
                  onChangeText={setContactOrEmailOrUsername}
                  placeholder="Enter email or phone"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                />

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
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={
                      loading
                        ? ["#555", "#444"]
                        : [COLORS.gradientcolor7, COLORS.gradientcolor8]
                    }
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.black} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Login</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={navigateToRegister}
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <Text style={styles.linkText}>Don't have an account? </Text>
                  <Text style={styles.linkText1}> Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      {/* </LinearGradient> */}
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default LoginPage;
