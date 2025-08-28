import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  InteractionManager,
  Dimensions,
  BackHandler,
  Image
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../utils';
import { BackHeader } from '../../components';
import { colors1 } from '../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

// Constants
const VALIDATION_RULES = {
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR_REGEX: /^\d{12}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE_REGEX: /^[6-9]\d{9}$/,
  PINCODE_REGEX: /^\d{6}$/,
  MIN_AGE: 18,
};

const STEP_TITLES = {
  1: 'Member Details',
  2: 'Plan Selection',
  3: 'Scheme Details',
};

// Enhanced Custom Picker Component
const CustomPicker = React.memo(({ 
  selectedValue, 
  onValueChange, 
  items, 
  placeholder = "Select an option", 
  enabled = true,
  error = false 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const selectedItem = useMemo(() => 
    items.find(item => item.value === selectedValue),
    [items, selectedValue]
  );

  useEffect(() => {
    setSelectedLabel(selectedItem ? selectedItem.label : placeholder);
  }, [selectedItem, placeholder]);

  const handleSelect = useCallback((item) => {
    onValueChange(item.value);
    setModalVisible(false);
  }, [onValueChange]);

  const openModal = useCallback(() => {
    if (enabled) {
      setModalVisible(true);
    }
  }, [enabled]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item.value === selectedValue && styles.selectedModalItem
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.modalItemText,
        item.value === selectedValue && styles.selectedModalItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  ), [selectedValue, handleSelect]);

  const keyExtractor = useCallback((item, index) => `${item.value}-${index}`, []);

  return (
    <View>
      <TouchableOpacity 
        style={[
          styles.pickerButton, 
          !enabled && styles.pickerDisabled,
          error && styles.inputError
        ]} 
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.pickerText, 
          selectedValue ? styles.selectedPickerText : styles.placeholderText
        ]}>
          {selectedLabel}
        </Text>
        <View style={styles.pickerIcon}>
          <Text style={styles.pickerIconText}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: screenWidth * 0.9 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity 
                style={styles.closeButtonContainer}
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 56,
                offset: 56 * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
});

// Enhanced Input Component
const ValidatedInput = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  required = false, 
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  editable = true,
  ...props 
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.asterisk}>*</Text>}
    </Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.multilineInput,
        error && styles.inputError,
        !editable && styles.inputDisabled
      ]}
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={colors.fontPlaceholder}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      multiline={multiline}
      editable={editable}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

// Validation utilities
const ValidationUtils = {
  validatePAN: (pan) => {
    if (!pan) return 'PAN Number is required';
    if (!VALIDATION_RULES.PAN_REGEX.test(pan)) {
      return 'Invalid PAN format. Should be like ABCDE1234F';
    }
    return '';
  },

  validateAadhaar: (aadhaar) => {
    if (!aadhaar) return 'Aadhaar Number is required';
    if (!VALIDATION_RULES.AADHAAR_REGEX.test(aadhaar)) {
      return 'Aadhaar should be 12 digits';
    }

    const verhoeffTable = {
      d: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
      ],
      p: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
      ],
      inv: [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]
    };

    let c = 0;
    const digits = aadhaar.split('').map(Number).reverse();

    for (let i = 0; i < digits.length; i++) {
      c = verhoeffTable.d[c][verhoeffTable.p[i % 8][digits[i]]];
    }

    return c === 0 ? '' : 'Invalid Aadhaar number';
  },

  validateEmail: (email) => {
    if (!email) return 'Email is required';
    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  validateMobile: (mobile) => {
    if (!mobile) return 'Mobile number is required';
    if (!VALIDATION_RULES.MOBILE_REGEX.test(mobile)) {
      return 'Please enter a valid 10-digit mobile number starting with 6-9';
    }
    return '';
  },

  validatePincode: (pincode) => {
    if (!pincode) return 'Pincode is required';
    if (!VALIDATION_RULES.PINCODE_REGEX.test(pincode)) {
      return 'Please enter a valid 6-digit pincode';
    }
    return '';
  },

  validateAge: (dob) => {
    if (!dob) return 'Date of Birth is required';
    
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < VALIDATION_RULES.MIN_AGE) {
      return `Member must be at least ${VALIDATION_RULES.MIN_AGE} years old`;
    }
    
    return '';
  }
};

// API service
const ApiService = {
  baseUrl: 'https://akj.brightechsoftware.com/v1/api',
  
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  },

  async getCitiesForPincode(pincode) {
    try {
      const response = await this.fetchWithTimeout(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const postOffices = data[0]?.PostOffice || [];
      
      if (postOffices.length > 0) {
        return {
          cities: postOffices.map(po => po.Name),
          state: postOffices[0].State,
        };
      }
      
      return { cities: [], state: '' };
    } catch (error) {
      console.error('Error fetching cities:', error);
      return { cities: [], state: '' };
    }
  },

  async getSchemes() {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/member/scheme`);
    if (!response.ok) throw new Error('Failed to fetch schemes');
    return response.json();
  },

  async getAmountsBySchemeId(schemeId) {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/member/schemeid?schemeId=${schemeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch amounts');
    return response.json();
  },

  async getTransactionTypes() {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/account/getTranType`);
    if (!response.ok) throw new Error('Failed to fetch transaction types');
    return response.json();
  },

  async getGoldRate() {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/account/todayrate`);
    if (!response.ok) throw new Error('Failed to fetch gold rate');
    return response.json();
  },

  async createMember(memberData) {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/member/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating member: ${errorText}`);
    }
    
    return response.json();
  }
};

// Main Component
const AddNewMember = () => {
  // Navigation and route
  const navigation = useNavigation();
  const route = useRoute();
  const { schemeId } = route.params || {};

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Plan type state
  const [planType, setPlanType] = useState(''); // 'digigold' or 'dreamgold'

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Details
    namePrefix: 'Mr',
    initial: '',
    name: '',
    surname: '',
    dob: new Date(),
    dateText: 'Select Date',
    mobile: '',
    email: '',
    panNumber: '',
    aadharNumber: '',
    
    // Address Details
    doorNo: '',
    address1: '',
    address2: '',
    area: '',
    city: '',
    selectedState: '',
    country: 'India',
    pincode: '',
    
    // Scheme Details
    selectedSchemeId: schemeId || null,
    amount: '',
    weight: '', // For DigiGold
    accCode: '',
    modePay: 'C',
    
    // DigiGold specific
    customAmount: '', // For DigiGold custom amount input
  });

  // Data state
  const [schemes, setSchemes] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [goldRate, setGoldRate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);

  // Indian states array
  const indianStates = useMemo(() => [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
    'Delhi', 'Puducherry'
  ], []);

  // Check if scheme is DigiGold or DreamGold
  const isDigiGold = useMemo(() => {
    if (!formData.selectedSchemeId || !schemes.length) return false;
    const selectedScheme = schemes.find(s => s.id === formData.selectedSchemeId);
    return selectedScheme && selectedScheme.name.toLowerCase().includes('digi');
  }, [formData.selectedSchemeId, schemes]);

  const isDreamGold = useMemo(() => {
    if (!formData.selectedSchemeId || !schemes.length) return false;
    const selectedScheme = schemes.find(s => s.id === formData.selectedSchemeId);
    return selectedScheme && selectedScheme.name.toLowerCase().includes('dream');
  }, [formData.selectedSchemeId, schemes]);

  // Back handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentStep === 3) {
          setCurrentStep(2);
          return true;
        } else if (currentStep === 2) {
          setCurrentStep(1);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentStep])
  );

  // Form update helper
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear validation error helper
  const clearValidationError = useCallback((field) => {
    setValidationErrors(prev => {
      if (prev[field]) {
        const { [field]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Convert amount to weight for DigiGold
  const convertAmountToWeight = useCallback((amount) => {
    if (goldRate && amount && !isNaN(amount) && amount > 0) {
      const weightInGrams = (parseFloat(amount) / goldRate).toFixed(3);
      updateFormData({ weight: weightInGrams });
    } else {
      updateFormData({ weight: '' });
    }
  }, [goldRate, updateFormData]);

  // Debounced pincode validation
  const debouncedPincodeValidation = useCallback(
    debounce(async (pincode) => {
      if (pincode && VALIDATION_RULES.PINCODE_REGEX.test(pincode)) {
        const { cities: fetchedCities, state } = await ApiService.getCitiesForPincode(pincode);
        setCities(fetchedCities);
        if (state && !formData.selectedState) {
          updateFormData({ selectedState: state });
        }
        if (fetchedCities.length > 0 && !fetchedCities.includes(formData.city)) {
          updateFormData({ city: '' });
        }
      } else {
        setCities([]);
        updateFormData({ selectedState: '', city: '' });
      }
    }, 500),
    [formData.selectedState, formData.city, updateFormData]
  );

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [schemesData, transactionTypesData, goldRateData] = await Promise.all([
          ApiService.getSchemes(),
          ApiService.getTransactionTypes(),
          ApiService.getGoldRate().catch(() => ({ Rate: 5000 })) // Fallback rate
        ]);

        const formattedSchemes = schemesData.map(s => ({
          id: s.SchemeId,
          name: s.schemeName,
          description: s.SchemeSName,
        }));

        setSchemes(formattedSchemes);
        setTransactionTypes(transactionTypesData);
        setGoldRate(goldRateData.Rate || 5000);

        // Set default scheme if provided
        if (schemeId && formattedSchemes.length > 0) {
          updateFormData({ selectedSchemeId: schemeId });
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        Alert.alert('Error', 'Failed to load initial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [schemeId, updateFormData]);

  // Fetch amounts when scheme changes
  useEffect(() => {
    const fetchAmounts = async () => {
      if (!formData.selectedSchemeId) return;

      try {
        setLoading(true);
        const data = await ApiService.getAmountsBySchemeId(formData.selectedSchemeId);
        
        const mappedAmounts = data.map(item => ({
          label: `${item.GROUPCODE} - ₹${item.AMOUNT}`,
          value: item.AMOUNT,
          groupCode: item.GROUPCODE,
          currentRegNo: item.CURRENTREGNO,
        }));

        setAmounts(mappedAmounts);
        
        // Only set default amount for DreamGold
        if (isDreamGold && mappedAmounts.length > 0) {
          const firstAmount = mappedAmounts[0];
          updateFormData({
            amount: firstAmount.value,
            groupCode: firstAmount.groupCode,
            currentRegNo: firstAmount.currentRegNo,
          });
        }
      } catch (error) {
        console.error('Error fetching amounts:', error);
        Alert.alert('Error', 'Failed to load scheme amounts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAmounts();
  }, [formData.selectedSchemeId, isDreamGold, updateFormData]);

  // Convert amount to weight when amount changes (for DigiGold)
  useEffect(() => {
    if (isDigiGold && formData.customAmount) {
      convertAmountToWeight(formData.customAmount);
    }
  }, [isDigiGold, formData.customAmount, convertAmountToWeight]);

  // Pincode validation effect
  useEffect(() => {
    debouncedPincodeValidation(formData.pincode);
  }, [formData.pincode, debouncedPincodeValidation]);

  // Validation functions
  const validateStep1 = useCallback(() => {
    const errors = {};
    const requiredFields = [
      'initial', 'name', 'surname', 'doorNo', 'address1', 'area', 
      'city', 'selectedState', 'country', 'pincode', 'mobile', 'email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (formData.dateText === 'Select Date') {
      errors.dob = 'Date of Birth is required';
    }

    // Specific validations
    const validationChecks = [
      { field: 'panNumber', validator: ValidationUtils.validatePAN },
      { field: 'aadharNumber', validator: ValidationUtils.validateAadhaar },
      { field: 'email', validator: ValidationUtils.validateEmail },
      { field: 'mobile', validator: ValidationUtils.validateMobile },
      { field: 'pincode', validator: ValidationUtils.validatePincode },
    ];

    validationChecks.forEach(({ field, validator }) => {
      if (formData[field]) {
        const error = validator(formData[field]);
        if (error) errors[field] = error;
      }
    });

    // Age validation
    if (formData.dob) {
      const ageError = ValidationUtils.validateAge(formData.dob);
      if (ageError) errors.dob = ageError;
    }

    // Country validation
    if (formData.country !== 'India') {
      errors.country = 'Country should be India';
    }

    // City validation for pincode
    if (formData.city && cities.length > 0 && !cities.includes(formData.city)) {
      errors.city = 'Please select a valid city for this pincode';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, cities]);

  const validateStep2 = useCallback(() => {
    const errors = {};
    
    if (!formData.selectedSchemeId) {
      errors.scheme = 'Please select a scheme';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const validateStep3 = useCallback(() => {
    const errors = {};
    
    if (isDigiGold) {
      if (!formData.customAmount || parseFloat(formData.customAmount) <= 0) {
        errors.customAmount = 'Please enter a valid amount';
      }
      if (parseFloat(formData.customAmount) < 1) {
        errors.customAmount = 'Minimum amount is ₹1';
      }
    } else if (isDreamGold) {
      if (!formData.amount) errors.amount = 'Please select an amount';
    }
    
    if (!formData.accCode) errors.accCode = 'Please select a payment mode';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isDigiGold, isDreamGold]);

  // Event handlers
  const handleInputChange = useCallback((field, value) => {
    updateFormData({ [field]: value });
    clearValidationError(field);
  }, [updateFormData, clearValidationError]);

  const handleCustomAmountChange = useCallback((text) => {
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

    handleInputChange('customAmount', sanitizedText);
    updateFormData({ amount: sanitizedText }); // Set amount for API
  }, [handleInputChange, updateFormData]);

  const handleMobileChange = useCallback((text) => {
    const cleanedText = text.replace(/\D/g, '').slice(0, 10);
    handleInputChange('mobile', cleanedText);
  }, [handleInputChange]);

  const handlePANChange = useCallback((text) => {
    const upperText = text.toUpperCase();
    handleInputChange('panNumber', upperText);
  }, [handleInputChange]);

  const handleAadhaarChange = useCallback((text) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 12);
    handleInputChange('aadharNumber', numericValue);
  }, [handleInputChange]);

  const handleDateChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || formData.dob;
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      updateFormData({ dob: currentDate, dateText: formattedDate });
      clearValidationError('dob');
    }
  }, [formData.dob, updateFormData, clearValidationError]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        InteractionManager.runAfterInteractions(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
      } else {
        Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        InteractionManager.runAfterInteractions(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
      } else {
        Alert.alert('Validation Error', 'Please select a scheme.');
      }
    }
  }, [currentStep, validateStep1, validateStep2]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!validateStep3()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalAmount = formData.amount;
      let selectedAmount = null;

      if (isDigiGold) {
        finalAmount = formData.customAmount;
      } else if (isDreamGold) {
        selectedAmount = amounts.find(amt => amt.value === formData.amount);
      }
      
     const memberData = {
  newMember: {
    title: formData.namePrefix,
    initial: formData.initial,
    pName: formData.name,
    sName: formData.surname,
    doorNo: formData.doorNo,
    address1: formData.address1,
    address2: formData.address2,
    area: formData.area,
    city: formData.city,
    state: formData.selectedState,
    country: formData.country,
    pinCode: formData.pincode,
    mobile: formData.mobile,
    idProof: formData.aadharNumber,
    idProofNo: formData.panNumber,
    dob: formData.dob, // This is a Date object
    email: formData.email,
    upDateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    userId: '999',
    appVer: '19.12.10.1',
  },
  createSchemeSummary: {
    schemeId: formData.selectedSchemeId,
    groupCode: selectedAmount?.groupCode || 'DIGI001', // Default for DigiGold
    regNo: selectedAmount?.currentRegNo || Date.now().toString(), // Generate for DigiGold
    joinDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    upDateTime2: new Date().toISOString().slice(0, 19).replace('T', ' '),
    openingDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    userId2: '9999',
  },
  schemeCollectInsert: {
    amount: finalAmount,
    modePay: formData.modePay,
    accCode: formData.accCode,
  }
      };

      await ApiService.createMember(memberData);
      
      Alert.alert('Success', 'Member added successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('MainLanding') }
      ]);

    } catch (error) {
      console.error('Error creating member:', error);
      Alert.alert('Error', error.message || 'Failed to create member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateStep3, formData, amounts, isDigiGold, isDreamGold, navigation]);

  // Render methods
  const renderCityInput = useCallback(() => {
    if (cities.length > 0) {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            City <Text style={styles.asterisk}>*</Text>
          </Text>
          <CustomPicker
            selectedValue={formData.city}
            onValueChange={(value) => handleInputChange('city', value)}
            items={[
              { label: "Select a City", value: "" },
              ...cities.map(cityName => ({ label: cityName, value: cityName }))
            ]}
            placeholder="Select a City"
            error={!!validationErrors.city}
          />
          {validationErrors.city && (
            <Text style={styles.errorText}>{validationErrors.city}</Text>
          )}
        </View>
      );
    }

    return (
      <ValidatedInput
        label="City"
        value={formData.city}
        onChangeText={(value) => handleInputChange('city', value)}
        placeholder="Enter City"
        error={validationErrors.city}
        required={true}
      />
    );
  }, [cities, formData.city, validationErrors.city, handleInputChange]);

  const renderDatePicker = useCallback(() => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        Date of Birth <Text style={styles.asterisk}>*</Text>
      </Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        style={[styles.dateInput, validationErrors.dob && styles.inputError]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.inputText,
          formData.dateText === 'Select Date' ? styles.placeholderText : styles.dateText
        ]}>
          {formData.dateText}
        </Text>
      </TouchableOpacity>
      {validationErrors.dob && (
        <Text style={styles.errorText}>{validationErrors.dob}</Text>
      )}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={formData.dob}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'spinner'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          style={styles.datePicker}
        />
      )}
    </View>
  ), [formData.dob, formData.dateText, validationErrors.dob, showDatePicker, handleDateChange]);

  const renderStep1 = useCallback(() => (
    <View style={styles.card}>
      <BackHeader 
        title={STEP_TITLES[1]}
        backPressed={() => navigation.goBack()}
        style={styles.header}
      />

      <ValidatedInput
        label="Name Prefix"
        value={formData.namePrefix}
        onChangeText={(value) => handleInputChange('namePrefix', value)}
        placeholder="Mr/Mrs/Ms"
      />

      <ValidatedInput
        label="Initial"
        value={formData.initial}
        onChangeText={(value) => handleInputChange('initial', value)}
        placeholder="Enter Initial"
        error={validationErrors.initial}
        required={true}
        maxLength={5}
      />

      <ValidatedInput
        label="First Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        placeholder="Enter First Name"
        error={validationErrors.name}
        required={true}
        maxLength={50}
      />

      <ValidatedInput
        label="Surname"
        value={formData.surname}
        onChangeText={(value) => handleInputChange('surname', value)}
        placeholder="Enter Surname"
        error={validationErrors.surname}
        required={true}
        maxLength={50}
      />

      <ValidatedInput
        label="Door No"
        value={formData.doorNo}
        onChangeText={(value) => handleInputChange('doorNo', value)}
        placeholder="Enter Door No"
        error={validationErrors.doorNo}
        required={true}
        maxLength={20}
      />

      <ValidatedInput
        label="Address 1"
        value={formData.address1}
        onChangeText={(value) => handleInputChange('address1', value)}
        placeholder="Enter Address 1"
        error={validationErrors.address1}
        required={true}
        maxLength={100}
        multiline={true}
      />

      <ValidatedInput
        label="Address 2"
        value={formData.address2}
        onChangeText={(value) => handleInputChange('address2', value)}
        placeholder="Enter Address 2 (Optional)"
        maxLength={100}
        multiline={true}
      />

      <ValidatedInput
        label="Area"
        value={formData.area}
        onChangeText={(value) => handleInputChange('area', value)}
        placeholder="Enter Area"
        error={validationErrors.area}
        required={true}
        maxLength={50}
      />

      <ValidatedInput
        label="Pincode"
        value={formData.pincode}
        onChangeText={(value) => handleInputChange('pincode', value)}
        placeholder="Enter 6-digit Pincode"
        error={validationErrors.pincode}
        required={true}
        keyboardType="numeric"
        maxLength={6}
      />
      {cities.length > 0 && (
        <Text style={styles.hintText}>
          Available cities: {cities.join(', ')}
        </Text>
      )}

      {renderCityInput()}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          State <Text style={styles.asterisk}>*</Text>
        </Text>
        <CustomPicker
          selectedValue={formData.selectedState}
          onValueChange={(value) => handleInputChange('selectedState', value)}
          items={[
            { label: "Select a State", value: "" },
            ...indianStates.map(state => ({ label: state, value: state }))
          ]}
          placeholder="Select a State"
          error={!!validationErrors.selectedState}
        />
        {validationErrors.selectedState && (
          <Text style={styles.errorText}>{validationErrors.selectedState}</Text>
        )}
      </View>

      <ValidatedInput
        label="Country"
        value={formData.country}
        onChangeText={(value) => handleInputChange('country', value)}
        placeholder="Enter Country"
        error={validationErrors.country}
        required={true}
        editable={false}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Mobile Number <Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={[
          styles.mobileInputContainer, 
          validationErrors.mobile && styles.inputError
        ]}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={[styles.input, styles.mobileInput]}
            onChangeText={handleMobileChange}
            value={formData.mobile}
            placeholder="Enter 10-digit Mobile Number"
            keyboardType="numeric"
            maxLength={10}
            placeholderTextColor={colors.fontPlaceholder}
          />
        </View>
        {validationErrors.mobile && (
          <Text style={styles.errorText}>{validationErrors.mobile}</Text>
        )}
      </View>

      {renderDatePicker()}

      <ValidatedInput
        label="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        placeholder="Enter Email Address"
        error={validationErrors.email}
        required={true}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={100}
      />

      <ValidatedInput
        label="PAN Number"
        value={formData.panNumber}
        onChangeText={handlePANChange}
        placeholder="Enter PAN Number (e.g., ABCDE1234F)"
        error={validationErrors.panNumber}
        required={true}
        maxLength={10}
        autoCapitalize="characters"
      />

      <ValidatedInput
        label="Aadhaar Number"
        value={formData.aadharNumber}
        onChangeText={handleAadhaarChange}
        placeholder="Enter 12-digit Aadhaar Number"
        error={validationErrors.aadharNumber}
        required={true}
        keyboardType="numeric"
        maxLength={12}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.navigate('MainLanding')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]} 
          onPress={handleNextStep}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [
    formData, validationErrors, handleInputChange, handleMobileChange, 
    handlePANChange, handleAadhaarChange, renderCityInput, renderDatePicker,
    indianStates, cities, handleNextStep, navigation
  ]);

  const renderStep2 = useCallback(() => (
    <View style={styles.card}>
      <BackHeader 
        title={STEP_TITLES[2]}
        backPressed={() => setCurrentStep(1)}
        style={styles.header}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Select Scheme <Text style={styles.asterisk}>*</Text>
        </Text>
        <CustomPicker
          selectedValue={formData.selectedSchemeId}
          onValueChange={(value) => {
            handleInputChange('selectedSchemeId', value);
            // Reset amount and weight when scheme changes
            updateFormData({ 
              amount: '', 
              customAmount: '', 
              weight: '',
              groupCode: '',
              currentRegNo: '' 
            });
          }}
          items={[
            { label: "Select a Scheme", value: "" },
            ...schemes.map(scheme => ({ 
              label: `${scheme.name} - ${scheme.description}`, 
              value: scheme.id 
            }))
          ]}
          placeholder="Select a Scheme"
          enabled={!isSubmitting}
          error={!!validationErrors.scheme}
        />
        {validationErrors.scheme && (
          <Text style={styles.errorText}>{validationErrors.scheme}</Text>
        )}
      </View>

      {formData.selectedSchemeId && (
        <View style={styles.schemePreview}>
          <View style={styles.cardHeader}>
            <Icon name={isDigiGold ? "flash-on" : "card-giftcard"} size={20} color={colors1.primary} />
            <Text style={styles.cardHeaderText}>
              {isDigiGold ? 'DIGI GOLD PLAN' : isDreamGold ? 'DREAM GOLD PLAN' : 'SELECTED PLAN'}
            </Text>
          </View>
          
          <View style={styles.schemeDetails}>
            <Text style={styles.schemeText}>
              {schemes.find(s => s.id === formData.selectedSchemeId)?.name}
            </Text>
            <Text style={styles.schemeDescription}>
              {schemes.find(s => s.id === formData.selectedSchemeId)?.description}
            </Text>
          </View>

          {isDigiGold && (
            <View style={styles.goldRateDisplay}>
              <View style={styles.rateSection}>
                <View style={styles.rateTextContainer}>
                  <Text style={styles.goldText}>Gold 22K (916)</Text>
                  <Text style={styles.rateText}>{goldRate ? `₹${goldRate} / gm` : 'Loading...'}</Text>
                </View>
              </View>
              <Text style={styles.rateSubtitle}>Value added and GST will be applicable</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton, isSubmitting && styles.buttonDisabled]}
          onPress={() => setCurrentStep(1)}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.nextButton, (!formData.selectedSchemeId || isSubmitting) && styles.buttonDisabled]} 
          onPress={handleNextStep}
          disabled={!formData.selectedSchemeId || isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [
    formData, schemes, validationErrors, isDigiGold, isDreamGold, goldRate,
    handleInputChange, updateFormData, isSubmitting, handleNextStep, setCurrentStep
  ]);

  const renderStep3 = useCallback(() => (
    <View style={styles.card}>
      <BackHeader 
        title={STEP_TITLES[3]}
        backPressed={() => setCurrentStep(2)}
        style={styles.header}
      />

      {/* DIGI GOLD SECTION */}
      {isDigiGold && (
        <View style={styles.digiGoldSection}>
          <View style={styles.cardHeader}>
            <Icon name="flash-on" size={20} color={colors1.primary} />
            <Text style={styles.cardHeaderText}>DIGI GOLD - Quick Buy</Text>
          </View>
          
          <View style={styles.quickPaySection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Icon name="currency-rupee" size={16} color={colors1.textSecondary} />
                <Text style={styles.label}>Amount (₹) <Text style={styles.asterisk}>*</Text></Text>
              </View>
              <TextInput
                style={[styles.input, validationErrors.customAmount && styles.inputError]}
                keyboardType="decimal-pad"
                value={formData.customAmount}
                onChangeText={handleCustomAmountChange}
                placeholder="Enter amount"
                placeholderTextColor={colors1.textSecondary}
                maxLength={10}
              />
              {validationErrors.customAmount && (
                <Text style={styles.errorText}>{validationErrors.customAmount}</Text>
              )}
            </View>
            
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
                value={formData.weight}
                editable={false}
                placeholder="Auto calculated"
                placeholderTextColor={colors1.textSecondary}
              />
            </View>
          </View>

          {formData.customAmount && goldRate && (
            <View style={styles.infoContainer}>
              <Icon name="info-outline" size={16} color={colors1.textSecondary} />
              <Text style={styles.infoText}>
                You will purchase {formData.weight}g of 22K gold
              </Text>
            </View>
          )}
        </View>
      )}

      {/* DREAM GOLD SECTION */}
      {isDreamGold && (
        <View style={styles.dreamGoldSection}>
          <View style={styles.cardHeader}>
            <Icon name="card-giftcard" size={20} color={colors1.primary} />
            <Text style={styles.cardHeaderText}>DREAM GOLD PLAN</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Amount <Text style={styles.asterisk}>*</Text>
            </Text>
            <CustomPicker
              selectedValue={formData.amount}
              onValueChange={(value) => {
                const selectedAmount = amounts.find(amt => amt.value === value);
                updateFormData({
                  amount: value,
                  groupCode: selectedAmount?.groupCode,
                  currentRegNo: selectedAmount?.currentRegNo,
                });
                clearValidationError('amount');
              }}
              items={amounts.map(amt => ({ 
                label: amt.label, 
                value: amt.value 
              }))}
              placeholder="Select Amount"
              enabled={!isSubmitting && amounts.length > 0}
              error={!!validationErrors.amount}
            />
            {validationErrors.amount && (
              <Text style={styles.errorText}>{validationErrors.amount}</Text>
            )}
            {loading && amounts.length === 0 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors1.primary} />
                <Text style={styles.loadingText}>Loading amounts...</Text>
              </View>
            )}
          </View>

          <View style={styles.paymentOptions}>
            <Text style={styles.paymentOptionsTitle}>Payment Options</Text>
            <View style={styles.paymentIcons}>
              <View style={styles.paymentIcon}>
                <Icon name="payment" size={24} color={colors1.primary} />
              </View>
              <View style={styles.paymentIcon}>
                <Icon name="account-balance-wallet" size={24} color={colors1.primary} />
              </View>
              <View style={styles.paymentIcon}>
                <Icon name="credit-card" size={24} color={colors1.primary} />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* PAYMENT MODE SECTION - Common for both */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Payment Mode <Text style={styles.asterisk}>*</Text>
        </Text>
        <CustomPicker
          selectedValue={formData.accCode}
          onValueChange={(value) => {
            const selectedType = transactionTypes.find(type => type.ACCOUNT === value);
            updateFormData({
              accCode: value,
              modePay: selectedType?.CARDTYPE || 'C'
            });
            clearValidationError('accCode');
          }}
          items={transactionTypes.map(type => ({ 
            label: type.NAME, 
            value: type.ACCOUNT 
          }))}
          placeholder="Select Payment Mode"
          enabled={!isSubmitting}
          error={!!validationErrors.accCode}
        />
        {validationErrors.accCode && (
          <Text style={styles.errorText}>{validationErrors.accCode}</Text>
        )}
      </View>

      {/* SUMMARY SECTION */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Member Name:</Text>
          <Text style={styles.summaryValue}>
            {`${formData.namePrefix} ${formData.initial} ${formData.name} ${formData.surname}`.trim()}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Mobile:</Text>
          <Text style={styles.summaryValue}>+91 {formData.mobile}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Plan Type:</Text>
          <Text style={styles.summaryValue}>
            {isDigiGold ? 'DigiGold' : isDreamGold ? 'DreamGold' : 'Standard'}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Amount:</Text>
          <Text style={styles.summaryValue}>
            ₹{isDigiGold ? formData.customAmount : formData.amount}
          </Text>
        </View>
        {isDigiGold && formData.weight && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gold Weight:</Text>
            <Text style={styles.summaryValue}>{formData.weight}g</Text>
          </View>
        )}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Payment Mode:</Text>
          <Text style={styles.summaryValue}>
            {transactionTypes.find(t => t.ACCOUNT === formData.accCode)?.NAME || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton, isSubmitting && styles.buttonDisabled]}
          onPress={() => setCurrentStep(2)}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors1.buttonText} size="small" />
              <Text style={[styles.buttonText, styles.loadingText]}>
                Submitting...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [
    formData, amounts, transactionTypes, validationErrors, isDigiGold, isDreamGold,
    loading, isSubmitting, goldRate, updateFormData, clearValidationError,
    handleCustomAmountChange, handleSubmit, setCurrentStep
  ]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  }, [currentStep, renderStep1, renderStep2, renderStep3]);

  // Loading state
  if (loading && schemes.length === 0) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={colors1.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / 3) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of 3
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors1.background,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors1.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors1.borderLight,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors1.borderLight,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors1.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: colors1.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors1.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: colors1.headerBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.primaryText,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors1.textPrimary,
    borderWidth: 1,
    borderColor: colors1.borderLight,
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors1.error,
  },
  inputDisabled: {
    backgroundColor: colors1.disabled,
    opacity: 0.7,
  },
  inputText: {
    fontSize: 16,
    color: colors1.textPrimary,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors1.borderLight,
  },
  pickerText: {
    fontSize: 16,
    color: colors1.textSecondary,
    flex: 1,
  },
  selectedPickerText: {
    color: colors1.textPrimary,
  },
  pickerIcon: {
    marginLeft: 10,
  },
  pickerIconText: {
    fontSize: 14,
    color: colors1.iconPrimary,
  },
  pickerDisabled: {
    opacity: 0.5,
    backgroundColor: colors1.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors1.cardBackground,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors1.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors1.primaryText,
  },
  closeButtonContainer: {
    padding: 8,
  },
  closeButton: {
    fontSize: 20,
    color: colors1.primary,
    fontWeight: 'bold',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors1.borderLight,
  },
  selectedModalItem: {
    backgroundColor: colors1.primaryLight,
  },
  modalItemText: {
    fontSize: 16,
    color: colors1.textPrimary,
  },
  selectedModalItemText: {
    color: colors1.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors1.buttonPrimary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 48,
  },
  backButton: {
    backgroundColor: colors1.buttonSecondary,
    borderWidth: 1,
    borderColor: colors1.borderDark,
  },
  nextButton: {
    backgroundColor: colors1.primary,
  },
  submitButton: {
    backgroundColor: colors1.success,
  },
  buttonText: {
    color: colors1.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: colors1.disabled,
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors1.textSecondary,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors1.background,
  },
  asterisk: {
    color: colors1.error,
    fontSize: 16,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors1.borderLight,
    paddingHorizontal: 12,
    height: 50,
  },
  countryCode: {
    fontSize: 16,
    color: colors1.primary,
    marginRight: 8,
    fontWeight: '600',
  },
  mobileInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: '100%',
  },
  errorText: {
    color: colors1.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  dateInput: {
    height: 50,
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors1.borderLight,
  },
  datePicker: {
    backgroundColor: colors1.sectionBackground,
    marginTop: 10,
  },
  placeholderText: {
    color: colors.fontPlaceholder,
    fontSize: 16,
  },
  dateText: {
    color: colors1.textPrimary,
    fontSize: 16,
  },
  schemeDisplay: {
    backgroundColor: colors1.sectionBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors1.borderLight,
  },
  schemeText: {
    fontSize: 16,
    color: colors1.textPrimary,
    fontWeight: '600',
  },
  schemeDescription: {
    fontSize: 14,
    color: colors1.textSecondary,
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: colors1.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors1.primary,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors1.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: colors1.textPrimary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  hintText: {
    color: colors1.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default AddNewMember;