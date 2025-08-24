import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  Alert, 
  BackHandler,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { alignment, colors } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { showToast } from '../../utils/toast';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors1 } from '../../utils/colors';

const { width } = Dimensions.get('window');

// Constants
const API_BASE_URL = 'https://akj.brightechsoftware.com';
const POLLING_INTERVAL = 5000; // 5 seconds
const POLLING_TIMEOUT = 300000; // 5 minutes

function Buy() {
  // State variables
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [goldRate, setGoldRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [goldRateError, setGoldRateError] = useState(false);

  // Refs for cleanup
  const verifyIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const navigation = useNavigation();
  const route = useRoute();
  
  // Route params
  const passedGoldRate = route.params?.goldRate;
  const isDreamGoldPlan = route.params?.isDreamGoldPlan;
  const accountDetails = route.params?.accountDetails;
  const productData = route.params?.productData;

  // Handle back button when WebView is open
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showWebView) {
          Alert.alert(
            'Cancel Payment',
            'Are you sure you want to cancel the payment?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                onPress: () => {
                  clearPaymentPolling();
                  setShowWebView(false);
                }
              },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [showWebView])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearPaymentPolling();
    };
  }, []);

  // Get user details from AsyncStorage
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const [storedPhoneNumber, storedUserName] = await Promise.all([
          AsyncStorage.getItem('userPhoneNumber'),
          AsyncStorage.getItem('userName')
        ]);
        
        if (isMountedRef.current) {
          if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
          if (storedUserName) setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Error getting user details:', error);
        if (isMountedRef.current) {
          Alert.alert('Error', 'Failed to load user details. Please login again.');
        }
      }
    };
    getUserDetails();
  }, []);

  // Set initial amount for dream gold plan
  useEffect(() => {
    if (isDreamGoldPlan && accountDetails?.amount) {
      const initialAmount = accountDetails.amount.toString();
      setAmount(initialAmount);
      convertAmountToWeight(initialAmount);
    }
  }, [isDreamGoldPlan, accountDetails, goldRate]);

  // Fetch gold rate from API
  const fetchGoldRate = async () => {
    try {
      setGoldRateError(false);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/v1/api/account/todayrate`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch gold rate`);
      }

      const data = await response.json();
      
      if (!data.Rate || isNaN(data.Rate)) {
        throw new Error('Invalid gold rate received from server');
      }

      if (isMountedRef.current) {
        setGoldRate(data.Rate);
      }
    } catch (error) {
      console.error('Error fetching gold rate:', error);
      if (isMountedRef.current) {
        setGoldRateError(true);
        setGoldRate(null);
        
        if (error.name !== 'AbortError') {
          Alert.alert(
            'Error',
            'Failed to fetch current gold rate. Please check your internet connection and try again.',
            [
              { text: 'Retry', onPress: fetchGoldRate },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Initialize gold rate
  useEffect(() => {
    if (passedGoldRate && !isNaN(passedGoldRate)) {
      setGoldRate(passedGoldRate);
      setLoading(false);
    } else {
      fetchGoldRate();
    }
  }, [passedGoldRate]);

  // Convert amount to weight
  const convertAmountToWeight = useCallback((amount) => {
    if (goldRate && amount && !isNaN(amount) && amount > 0) {
      const weightInGrams = (parseFloat(amount) / goldRate).toFixed(3);
      setWeight(weightInGrams);
    } else {
      setWeight('');
    }
  }, [goldRate]);

  // Handle amount input change
  const handleAmountChange = (text) => {
    // Only allow numbers and decimal point
    const sanitizedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitizedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(sanitizedText);
    convertAmountToWeight(sanitizedText);
  };

  // Clear payment polling intervals
  const clearPaymentPolling = () => {
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
      verifyIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Validate payment inputs
  const validatePaymentInputs = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount greater than 0');
      return false;
    }

    if (parseFloat(amount) < 1) {
      showToast('Minimum payment amount is ₹1');
      return false;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      showToast('Valid phone number not found. Please login again.');
      return false;
    }

    if (!userName || userName.trim().length === 0) {
      showToast('User name not found. Please login again.');
      return false;
    }

    if (!productData || !productData.regno || !productData.groupcode) {
      showToast('Product details are missing. Please try again.');
      return false;
    }

    if (!goldRate) {
      showToast('Gold rate not available. Please refresh and try again.');
      return false;
    }

    return true;
  };

  // Create payment link
  const createPaymentLink = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          customer: {
            name: userName.trim(),
            contact: phoneNumber,
            REGNO: productData.regno,
            GROUPCODE: productData.groupcode,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to generate payment link'}`);
      }

      const responseText = await response.text();
      console.log('Payment Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response format from server');
      }

      if (!data || !data.payment_link || !data.order_id) {
        console.error('Invalid response data:', data);
        throw new Error('Payment link or order ID not received from server');
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  // Start payment verification polling
  const startPaymentVerification = (orderId) => {
    clearPaymentPolling(); // Clear any existing intervals

    verifyIntervalRef.current = setInterval(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const verifyResponse = await fetch(
          `${API_BASE_URL}/api/payment/verify?orderId=${orderId}`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        clearTimeout(timeoutId);

        if (!verifyResponse.ok) {
          console.warn('Verification request failed:', verifyResponse.status);
          return;
        }

        const verifyData = await verifyResponse.json();
        console.log('Verification response:', verifyData);
        
        if (verifyData.razorpay_status === 'paid' && verifyData.success) {
          clearPaymentPolling();
          
          if (isMountedRef.current) {
            setShowWebView(false);
            Alert.alert(
              'Payment Successful! 🎉',
              `Payment of ₹${amount} completed successfully. Your gold purchase has been processed.`,
              [
                {
                  text: 'Continue',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainLanding' }],
                    });
                  },
                },
              ]
            );
          }
        } else if (verifyData.razorpay_status === 'failed' || verifyData.razorpay_status === 'cancelled') {
          clearPaymentPolling();
          
          if (isMountedRef.current) {
            setShowWebView(false);
            Alert.alert('Payment Failed', 'Your payment was not successful. Please try again.');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        // Continue polling on error, don't stop
      }
    }, POLLING_INTERVAL);

    // Set timeout to stop polling after 5 minutes
    timeoutRef.current = setTimeout(() => {
      clearPaymentPolling();
      if (isMountedRef.current && showWebView) {
        Alert.alert(
          'Payment Timeout',
          'Payment verification timed out. Please check your payment status manually or contact support.',
          [
            {
              text: 'OK',
              onPress: () => setShowWebView(false),
            },
          ]
        );
      }
    }, POLLING_TIMEOUT);
  };

  // Handle payment process
  const handlePay = async () => {
    if (!validatePaymentInputs()) {
      return;
    }

    try {
      setPaymentLoading(true);
      
      const paymentData = await createPaymentLink();
      
      if (isMountedRef.current) {
        setOrderId(paymentData.order_id);
        setPaymentUrl(paymentData.payment_link);
        setShowWebView(true);
        
        // Start payment verification
        startPaymentVerification(paymentData.order_id);
      }

    } catch (error) {
      console.error('Payment error:', error);
      if (isMountedRef.current) {
        Alert.alert(
          'Payment Error',
          error.message || 'Failed to process payment. Please try again.',
          [
            { text: 'OK' }
          ]
        );
      }
    } finally {
      if (isMountedRef.current) {
        setPaymentLoading(false);
      }
    }
  };

  // Handle WebView navigation changes
  const handleWebViewNavigationStateChange = (navState) => {
    console.log('WebView navigation:', navState.url);
    
    const url = navState.url.toLowerCase();
    if (url.includes('success') || url.includes('payment-success') || url.includes('completed')) {
      console.log('Success URL detected, waiting for verification...');
    } else if (url.includes('failure') || url.includes('payment-failed') || url.includes('cancelled')) {
      clearPaymentPolling();
      setShowWebView(false);
      showToast('Payment was not successful. Please try again.');
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    showToast('Failed to load payment page. Please check your internet connection and try again.');
  };

  // WebView component
  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors1.background }}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Alert.alert(
                'Cancel Payment',
                'Are you sure you want to cancel the payment?',
                [
                  { text: 'No', style: 'cancel' },
                  { 
                    text: 'Yes', 
                    onPress: () => {
                      clearPaymentPolling();
                      setShowWebView(false);
                    }
                  },
                ]
              );
            }}
          >
            <Icon name="close" size={24} color={colors1.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Complete Payment</Text>
          <View style={styles.closeButton} />
        </View>
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors1.primary} />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gold Rate Card */}
        {!isDreamGoldPlan && (
          <View style={styles.rateCard}>
            <View style={styles.cardHeader}>
              <Icon name="trending-up" size={20} color={colors1.primary} />
              <Text style={styles.cardHeaderText}>Current Gold Rate</Text>
            </View>
            <Text style={styles.cardSubtitle}>Value added and GST will be applicable</Text>
            <View style={styles.rateContent}>
              <View style={styles.rateSection}>
                <Image 
                  source={require('../../assets/gold.png')} 
                  style={styles.goldImage} 
                  resizeMode="contain"
                />
                <View style={styles.rateTextContainer}>
                  <Text style={styles.goldText}>Gold 22K (916)</Text>
                  {loading ? (
                    <ActivityIndicator size="small" color={colors1.primary} />
                  ) : goldRateError ? (
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={fetchGoldRate}
                    >
                      <Text style={styles.retryText}>Tap to retry</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.rateText}>{`₹${goldRate} / gm`}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* DREAM GOLD PLAN UI */}
        {isDreamGoldPlan ? (
          <View style={styles.dreamGoldCard}>
            <View style={styles.cardHeader}>
              <Icon name="card-giftcard" size={20} color={colors1.primary} />
              <Text style={styles.cardHeaderText}>DREAM GOLD PLAN</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="code" size={16} color={colors1.textSecondary} />
                  <Text style={styles.detailLabel}>Group Code</Text>
                </View>
                <Text style={styles.detailValue}>{productData?.groupcode || '-'}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="badge" size={16} color={colors1.textSecondary} />
                  <Text style={styles.detailLabel}>Membership No</Text>
                </View>
                <Text style={styles.detailValue}>{productData?.regno || '-'}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="account-balance-wallet" size={16} color={colors1.textSecondary} />
                  <Text style={styles.detailLabel}>Scheme Amount</Text>
                </View>
                <Text style={styles.detailValue}>{productData?.amountWeight?.Amount || '-'}</Text>
              </View>
            </View>

            <View style={styles.paymentOptions}>
              <Text style={styles.paymentOptionsTitle}>Payment Options</Text>
              <View style={styles.paymentIcons}>
                <Image 
                  source={require('../../assets/images/gpay.jpeg')} 
                  style={styles.paymentIcon} 
                />
                <Image 
                  source={require('../../assets/images/gpay.jpeg')} 
                  style={styles.paymentIcon} 
                />
                <Image 
                  source={require('../../assets/images/gpay.jpeg')} 
                  style={styles.paymentIcon} 
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.payButton, paymentLoading && styles.disabledButton]}
              onPress={handlePay}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator color={colors1.buttonText} />
              ) : (
                <>
                  <Icon name="payment" size={20} color={colors1.buttonText} />
                  <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Quick Pay Card (current buying container) only for DigiGold
          <View style={styles.quickPayCard}>
            <View style={styles.cardHeader}>
              <Icon name="flash-on" size={20} color={colors1.primary} />
              <Text style={styles.cardHeaderText}>Quick Pay</Text>
            </View>
            
            <View style={styles.quickPaySection}>
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Icon name="currency-rupee" size={16} color={colors1.textSecondary} />
                  <Text style={styles.label}>Amount (₹)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={amount}           
                  editable={!isDreamGoldPlan && !paymentLoading}
                  onChangeText={handleAmountChange}
                  placeholder="Enter amount"
                  placeholderTextColor={colors1.textSecondary}
                  maxLength={10}
                />
              </View>
              
              {/* Only show weight conversion for DigiGold plans */}
              {!isDreamGoldPlan && (
                <>
                  <View style={styles.conversionArrow}>
                    <Icon name="swap-vert" size={24} color={colors1.primary} />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabelContainer}>
                      <Icon name="scale" size={16} color={colors1.textSecondary} />
                      <Text style={styles.label}>Weight (grams)</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={weight}
                      editable={false}
                      placeholder="Auto calculated"
                      placeholderTextColor={colors1.textSecondary}
                    />
                  </View>
                </>
              )}
            </View>
            
            {/* Payment Button */}
            <TouchableOpacity 
              style={[
                styles.payButton, 
                (paymentLoading || loading || !goldRate || !amount || parseFloat(amount) <= 0) && styles.disabledButton
              ]} 
              onPress={handlePay}
              disabled={paymentLoading || loading || !goldRate || !amount || parseFloat(amount) <= 0}
            >
              {paymentLoading ? (
                <ActivityIndicator color={colors1.buttonText} />
              ) : (
                <>
                  <Icon name="payment" size={20} color={colors1.buttonText} />
                  <Text style={styles.payButtonText}>
                    {amount && goldRate ? `Pay ₹${amount}` : 'Proceed to pay'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {/* Info Text */}
            {amount && goldRate && (
              <View style={styles.infoContainer}>
                <Icon name="info-outline" size={16} color={colors1.textSecondary} />
                <Text style={styles.infoText}>
                  {isDreamGoldPlan 
                    ? `You will pay ₹${amount} for your Dream Gold plan`
                    : `You will purchase ${weight}g of 22K gold`
                  }
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors1.background,
    padding: 16,
  },
  rateCard: {
    backgroundColor: colors1.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  dreamGoldCard: {
    backgroundColor: colors1.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  quickPayCard: {
    backgroundColor: colors1.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors1.textPrimary,
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors1.textSecondary,
    marginBottom: 16,
  },
  rateContent: {
    backgroundColor: colors1.sectionBackground,
    borderRadius: 12,
    padding: 16,
  },
  rateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldImage: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  rateTextContainer: {
    flex: 1,
  },
  goldText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.textPrimary,
    marginBottom: 4,
  },
  rateText: {
    fontSize: 18,
    color: colors1.primary,
    fontWeight: 'bold',
  },
  retryButton: {
    padding: 4,
  },
  retryText: {
    fontSize: 14,
    color: colors1.error,
    textDecorationLine: 'underline',
  },
  detailsContainer: {
    backgroundColor: colors1.sectionBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: colors1.textSecondary,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors1.borderLight,
    marginVertical: 4,
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.textPrimary,
    marginBottom: 12,
  },
  paymentIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
  },
  quickPaySection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: colors1.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: colors1.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors1.textPrimary,
    fontSize: 16,
    backgroundColor: colors1.cardBackground,
  },
  disabledInput: {
    backgroundColor: colors1.sectionBackground,
    color: colors1.textSecondary,
  },
  conversionArrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  payButton: {
    backgroundColor: colors1.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 56,
    shadowColor: colors1.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: colors1.textSecondary,
    opacity: 0.7,
  },
  payButtonText: {
    color: colors1.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 8,
    color: colors1.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors1.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors1.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors1.sectionBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors1.textPrimary,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors1.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors1.textSecondary,
  },
});

export default Buy;