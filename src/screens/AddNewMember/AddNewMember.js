import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../utils'; // Assuming colors are exported from utils
import { BackHeader } from '../../components';
import { colors1 } from '../../utils/colors';

// Verhoeff Algorithm Tables
const verhoeffMultiplicationTable = [
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
];

const verhoeffPermutationTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

// Verhoeff algorithm implementation
const verhoeffValidation = (aadhaarNumber) => {
    try {
        const digits = aadhaarNumber.split('').map(Number).reverse();
        let checksum = 0;
        
        for (let i = 0; i < digits.length; i++) {
            checksum = verhoeffMultiplicationTable[checksum][verhoeffPermutationTable[i % 8][digits[i]]];
        }
        
        return checksum === 0;
    } catch (error) {
        console.error('Error in Verhoeff validation:', error);
        return false;
    }
};

// Enhanced validation functions
const validateAadhaar = (aadhaar) => {
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
    
    if (!cleanAadhaar) {
        return 'Aadhaar Number is required';
    }
    
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(cleanAadhaar)) {
        return 'Aadhaar should be exactly 12 digits';
    }
    
    if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
        return 'Invalid Aadhaar number (all digits are same)';
    }
    
    const invalidPatterns = [
        '000000000000', '111111111111', '222222222222', '333333333333',
        '444444444444', '555555555555', '666666666666', '777777777777',
        '888888888888', '999999999999', '123456789012', '012345678901'
    ];
    
    if (invalidPatterns.includes(cleanAadhaar)) {
        return 'Invalid Aadhaar number format';
    }
    
    if (!verhoeffValidation(cleanAadhaar)) {
        return 'Invalid Aadhaar number (checksum validation failed)';
    }
    
    return '';
};

const validatePAN = (pan) => {
    const cleanPAN = pan.replace(/\s/g, '').toUpperCase();
    
    if (!cleanPAN) {
        return 'PAN Number is required';
    }
    
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPAN)) {
        return 'Invalid PAN format. Should be like ABCDE1234F (5 letters, 4 digits, 1 letter)';
    }
    
    const fourthChar = cleanPAN.charAt(3);
    const validEntityCodes = ['P', 'F', 'C', 'H', 'A', 'T', 'B', 'L', 'J', 'G'];
    if (!validEntityCodes.includes(fourthChar)) {
        return 'Invalid PAN format. 4th character should be a valid entity code';
    }
    
    return '';
};

const validateMobile = (mobile) => {
    const cleanMobile = mobile.replace(/\D/g, '');
    
    if (!cleanMobile) {
        return 'Mobile number is required';
    }
    
    if (cleanMobile.length !== 10) {
        return 'Mobile number should be exactly 10 digits';
    }
    
    if (!/^[6-9]/.test(cleanMobile)) {
        return 'Mobile number should start with 6, 7, 8, or 9';
    }
    
    if (/^(\d)\1{9}$/.test(cleanMobile)) {
        return 'Invalid mobile number (all digits are same)';
    }
    
    return '';
};

const validateEmail = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail) {
        return 'Email is required';
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
        return 'Please enter a valid email address';
    }
    
    if (cleanEmail.length > 254) {
        return 'Email address is too long';
    }
    
    if (cleanEmail.includes('..')) {
        return 'Email address cannot have consecutive dots';
    }
    
    return '';
};

const validatePincode = (pincode) => {
    const cleanPincode = pincode.replace(/\D/g, '');
    
    if (!cleanPincode) {
        return 'Pincode is required';
    }
    
    if (cleanPincode.length !== 6) {
        return 'Please enter a valid 6-digit pincode';
    }
    
    if (cleanPincode.startsWith('0')) {
        return 'Invalid pincode format';
    }
    
    return '';
};

const validateAge = (dob) => {
    if (!dob) {
        return 'Date of Birth is required';
    }
    
    const today = new Date();
    const birthDate = new Date(dob);
    
    if (birthDate > today) {
        return 'Date of Birth cannot be in the future';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        return 'Member must be at least 18 years old';
    }
    
    if (age > 120) {
        return 'Please enter a valid date of birth';
    }
    
    return '';
};

// Custom Picker Component
const CustomPicker = ({ selectedValue, onValueChange, items, placeholder = "Select an option", enabled = true }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');

    useEffect(() => {
        const selected = items.find(item => item.value === selectedValue);
        setSelectedLabel(selected ? selected.label : placeholder);
    }, [selectedValue, items, placeholder]);

    const handleSelect = (item) => {
        onValueChange(item.value);
        setModalVisible(false);
    };

    return (
        <View>
            <TouchableOpacity 
                style={[styles.pickerButton, !enabled && styles.pickerDisabled]} 
                onPress={() => enabled && setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.pickerText, selectedValue ? {} : styles.placeholderText]}>
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
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Option</Text>
                            <TouchableOpacity 
                                style={styles.closeButtonContainer}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
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
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const AddNewMember = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [scheme, setScheme] = useState('');
    const navigation = useNavigation();
    const [selectedGroupcodetObj, setSelectedGroupcodeObj] = useState(null);
    const [selectedCurrentRegcodetObj, setSelectedCurrentRegObj] = useState(null);
    const [namePrefix, setNamePrefix] = useState('Mr');
    const [initial, setInitial] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [doorNo, setDoorNo] = useState('');
    const [loading, setLoading] = useState(true);
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [mobile, setMobile] = useState('');
    const [isMobileValid, setIsMobileValid] = useState(true);
    const [email, setEmail] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [schemes, setSchemes] = useState([]);
    const [amounts, setAmounts] = useState([]);
    const [selectedSchemeId, setSelectedSchemeId] = useState(null);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [amount, setAmount] = useState('');
    const [accCode, setAccCode] = useState('');
    const [modePay, setModepay] = useState('C');
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateText, setDateText] = useState('Select Date');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    const [cities, setCities] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

    const handleBack = () => {
        navigation.navigate('MainLanding');
    };

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
        'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
        'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
        'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 
        'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 
        'Delhi', 'Puducherry'
    ];

    const route = useRoute();
    const { schemeId } = route.params || {};

    useEffect(() => {
        if (schemeId) {
            setSelectedSchemeId(schemeId);
        }
    }, [schemeId]);

    useEffect(() => {
        const fetchCitiesForPincode = async () => {
            if (pincode && pincode.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                    if (response.ok) {
                        const data = await response.json();

                        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice) {
                            const postOffices = data[0].PostOffice;

                            const cityList = [...new Set(postOffices.map(po => po.Name))];
                            setCities(cityList);

                            const stateName = postOffices[0].State;
                            setSelectedState(stateName);

                            if (city && !cityList.includes(city)) {
                                setCity('');
                            }
                        } else {
                            setCities([]);
                            setCity('');
                            setSelectedState('');
                        }
                    } else {
                        setCities([]);
                        setCity('');
                        setSelectedState('');
                    }
                } catch (error) {
                    console.error('Error fetching cities:', error);
                    setCities([]);
                    setCity('');
                    setSelectedState('');
                }
            } else {
                setCities([]);
                setCity('');
                setSelectedState('');
            }
        };

        fetchCitiesForPincode();
    }, [pincode]);

    const validateStep1 = () => {
        const errors = {};
        
        // Basic field validations
        if (!initial.trim()) errors.initial = 'Initial is required';
        if (!name.trim()) errors.name = 'First Name is required';
        if (!surname.trim()) errors.surname = 'Surname is required';
        if (!doorNo.trim()) errors.doorNo = 'Door No is required';
        if (!address1.trim()) errors.address1 = 'Address 1 is required';
        if (!area.trim()) errors.area = 'Area is required';
        if (!selectedState) errors.selectedState = 'State is required';
        if (!country.trim()) errors.country = 'Country is required';
        if (dateText === 'Select Date') errors.dob = 'Date of Birth is required';

        // Enhanced validations using new functions
        const pincodeError = validatePincode(pincode);
        if (pincodeError) {
            errors.pincode = pincodeError;
        } else if (pincode && cities.length === 0) {
            errors.pincode = 'Please enter a valid pincode';
        }

        if (!city.trim()) {
            errors.city = 'City is required';
        } else if (city && cities.length > 0 && !cities.includes(city)) {
            errors.city = 'Please select a valid city for this pincode';
        }

        const mobileError = validateMobile(mobile);
        if (mobileError) errors.mobile = mobileError;

        const emailError = validateEmail(email);
        if (emailError) errors.email = emailError;

        const panError = validatePAN(panNumber);
        if (panError) errors.panNumber = panError;

        const aadhaarError = validateAadhaar(aadharNumber);
        if (aadhaarError) errors.aadharNumber = aadhaarError;

        if (country !== 'India') errors.country = 'Country should be India';

        const ageError = validateAge(dob);
        if (ageError) errors.dob = ageError;

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const errors = {};
        if (!selectedSchemeId) errors.scheme = 'Please select a scheme';
        if (!amount) errors.amount = 'Please select an amount';
        if (!accCode) errors.accCode = 'Please select a payment mode';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const response = await fetch('https://akj.brightechsoftware.com/v1/api/member/scheme');
                const data = await response.json();
                const formattedSchemes = data.map(s => ({
                    id: s.SchemeId,
                    name: s.schemeName,
                    description: s.SchemeSName,
                }));
                setSchemes(formattedSchemes);
            } catch (error) {
                console.error('Error fetching schemes:', error);
            }
        };

        fetchSchemes();
    }, []);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await fetch('https://akj.brightechsoftware.com/v1/api/company');
                const data = await response.json();
                if (data && data.length > 0) {
                    setCompanyData(data.message);
                }
            } catch (error) {
                console.error('Error fetching company data:', error);
                Alert.alert('Error', 'Failed to fetch company details');
            }
        };

        fetchCompanyData();
    }, []);

    useEffect(() => {
        const fetchTransactionTypes = async () => {
            try {
                const response = await fetch('https://akj.brightechsoftware.com/v1/api/account/getTranType');
                if (!response.ok) throw new Error('Network response was not ok.');
                const data = await response.json();
                setTransactionTypes(data);
            } catch (error) {
                console.error('Error fetching transaction types:', error);
            }
        };
        fetchTransactionTypes();
    }, []);

    useEffect(() => {
        const fetchAmount = async (schemeId) => {
            if (!schemeId) return;
            setLoading(true);
            try {
                const response = await fetch(`https://akj.brightechsoftware.com/v1/api/member/schemeid?schemeId=${schemeId}`);
                const data = await response.json();
                if (data.length === 0) {
                    setAmounts([]);
                    setAmount('');
                    return;
                }
                const mappedAmounts = data.map(item => ({
                    label: item.GROUPCODE,
                    value: item.AMOUNT,
                    groupCode: item.GROUPCODE,
                    currentRegNo: item.CURRENTREGNO,
                }));
                setAmounts(mappedAmounts);
                setAmount(mappedAmounts[0]?.value || '');
                setSelectedGroupcodeObj(mappedAmounts[0]?.groupCode || '');
                setSelectedCurrentRegObj(mappedAmounts[0]?.currentRegNo || '');
            } catch (error) {
                console.error('Error fetching amounts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedSchemeId) fetchAmount(selectedSchemeId);
    }, [selectedSchemeId]);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!validateStep2()) {
            Alert.alert('Validation Error', 'Please fill all required fields correctly.');
            return;
        }

        setIsSubmitting(true);

        const newMember = {
            title: namePrefix,
            initial,
            pName: name,
            sName: surname,
            doorNo,
            address1,
            address2,
            area,
            city,
            state: selectedState,
            country,
            pinCode: pincode,
            mobile,
            idProof: aadharNumber,
            idProofNo: panNumber,
            dob,
            email,
            upDateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            userId: '999',
            appVer: '19.12.10.1',
        };

        const createSchemeSummary = {
            schemeId: selectedSchemeId,
            groupCode: selectedGroupcodetObj,
            regNo: selectedCurrentRegcodetObj,
            joinDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            upDateTime2: new Date().toISOString().slice(0, 19).replace('T', ' '),
            openingDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            userId2: '9999',
        };

        const schemeCollectInsert = {
            amount,
            modePay,
            accCode
        };

        const requestBody = {
            newMember,
            createSchemeSummary,
            schemeCollectInsert
        };

        try {
            const response = await fetch('https://akj.brightechsoftware.com/v1/api/member/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Error creating member: ' + response.statusText);
            }

            Alert.alert('Success', 'Member added successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('MainLanding') }
            ]);
            resetFormFields();

        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetFormFields = () => {
        setScheme('');
        setSelectedGroupcodeObj(null);
        setSelectedCurrentRegObj(null);
        setInitial('');
        setName('');
        setSurname('');
        setDoorNo('');
        setAddress1('');
        setAddress2('');
        setArea('');
        setCity('');
        setSelectedState('');
        setState('');
        setCountry('India');
        setPincode('');
        setMobile('');
        setDob(new Date());
        setDateText('Select Date');
        setEmail('');
        setPanNumber('');
        setAadharNumber('');
        setAmounts([]);
        setAmount('');
        setAccCode('');
        setModepay('C');
        setSelectedSchemeId(null);
        setValidationErrors({});
    };

    useEffect(() => {
        if (schemes.length > 0) {
            const defaultSchemeId = schemes[0].id;
            setSelectedSchemeId(defaultSchemeId);
        }
    }, [schemes]);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dob;
        setShowDatePicker(Platform.OS === 'ios');
        setDob(currentDate);
        
        if (selectedDate) {
            const formattedDate = selectedDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            setDateText(formattedDate);
            
            // Clear validation error when date is selected
            if (validationErrors.dob) {
                setValidationErrors(prev => ({ ...prev, dob: '' }));
            }
        }
    };

    const showPicker = () => {
        setShowDatePicker(true);
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        } else {
            Alert.alert('Validation Error', 'Please fill all required fields correctly.');
        }
    };

    const handleMobileChange = (text) => {
        const cleanedText = text.replace(/\D/g, '');
        if (cleanedText.length <= 10) {
            setMobile(cleanedText);
            setIsMobileValid(/^[6-9]\d{9}$/.test(cleanedText) || cleanedText.length === 0);
            
            // Clear validation error when user starts typing
            if (validationErrors.mobile) {
                setValidationErrors(prev => ({ ...prev, mobile: '' }));
            }
        }
    };

    const handleAadhaarChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setAadharNumber(numericValue);
        
        // Clear validation error when user starts typing
        if (validationErrors.aadharNumber) {
            setValidationErrors(prev => ({ ...prev, aadharNumber: '' }));
        }
    };

    const handlePANChange = (text) => {
        const upperText = text.toUpperCase();
        setPanNumber(upperText);
        
        // Clear validation error when user starts typing
        if (validationErrors.panNumber) {
            setValidationErrors(prev => ({ ...prev, panNumber: '' }));
        }
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        
        // Clear validation error when user starts typing
        if (validationErrors.email) {
            setValidationErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePincodeChange = (text) => {
        const numericValue = text.replace(/\D/g, '');
        setPincode(numericValue);
        
        // Clear validation error when user starts typing
        if (validationErrors.pincode) {
            setValidationErrors(prev => ({ ...prev, pincode: '' }));
        }
    };

    const renderDatePicker = () => {
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>
                    Date of Birth <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity 
                    onPress={showPicker} 
                    style={[styles.dateInput, validationErrors.dob && styles.inputError]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.inputText, dateText === 'Select Date' ? styles.placeholderText : styles.dateText]}>
                        {dateText}
                    </Text>
                </TouchableOpacity>
                {validationErrors.dob && (
                    <Text style={styles.errorText}>{validationErrors.dob}</Text>
                )}
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dob}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                    />
                )}
            </View>
        );
    };

    const renderCityInput = () => {
        if (cities.length > 0) {
            return (
                <View style={[styles.inputContainer, validationErrors.city && styles.inputError]}>
                    <Text style={styles.label}>
                        City <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <CustomPicker
                        selectedValue={city}
                        onValueChange={(value) => {
                            setCity(value);
                            if (validationErrors.city) {
                                setValidationErrors(prev => ({ ...prev, city: '' }));
                            }
                        }}
                        items={[
                            { label: "Select a City", value: "" },
                            ...cities.map(cityName => ({ label: cityName, value: cityName }))
                        ]}
                        placeholder="Select a City"
                    />
                    {validationErrors.city && (
                        <Text style={styles.errorText}>{validationErrors.city}</Text>
                    )}
                </View>
            );
        }

        return (
            <View style={[styles.inputContainer, validationErrors.city && styles.inputError]}>
                <Text style={styles.label}>
                    City <Text style={styles.asterisk}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setCity(text);
                        if (validationErrors.city) {
                            setValidationErrors(prev => ({ ...prev, city: '' }));
                        }
                    }}
                    value={city}
                    placeholder="Enter City"
                    placeholderTextColor={colors.fontPlaceholder}
                    editable={cities.length === 0}
                />
                {validationErrors.city && (
                    <Text style={styles.errorText}>{validationErrors.city}</Text>
                )}
            </View>
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.card}>
                        <BackHeader 
                            title="Member Details"
                            backPressed={() => navigation.goBack()}
                            style={styles.header}
                        />
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Initial <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.initial && styles.inputError]}
                                onChangeText={(text) => {
                                    setInitial(text);
                                    if (validationErrors.initial) {
                                        setValidationErrors(prev => ({ ...prev, initial: '' }));
                                    }
                                }}
                                value={initial}
                                placeholder="Enter Initial"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.initial && (
                                <Text style={styles.errorText}>{validationErrors.initial}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>First Name <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.name && styles.inputError]}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (validationErrors.name) {
                                        setValidationErrors(prev => ({ ...prev, name: '' }));
                                    }
                                }}
                                value={name}
                                placeholder="Enter First Name"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.name && (
                                <Text style={styles.errorText}>{validationErrors.name}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Surname <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.surname && styles.inputError]}
                                onChangeText={(text) => {
                                    setSurname(text);
                                    if (validationErrors.surname) {
                                        setValidationErrors(prev => ({ ...prev, surname: '' }));
                                    }
                                }}
                                value={surname}
                                placeholder="Enter Surname"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.surname && (
                                <Text style={styles.errorText}>{validationErrors.surname}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Door No <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.doorNo && styles.inputError]}
                                onChangeText={(text) => {
                                    setDoorNo(text);
                                    if (validationErrors.doorNo) {
                                        setValidationErrors(prev => ({ ...prev, doorNo: '' }));
                                    }
                                }}
                                value={doorNo}
                                placeholder="Enter Door No"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.doorNo && (
                                <Text style={styles.errorText}>{validationErrors.doorNo}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Address 1 <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.address1 && styles.inputError]}
                                onChangeText={(text) => {
                                    setAddress1(text);
                                    if (validationErrors.address1) {
                                        setValidationErrors(prev => ({ ...prev, address1: '' }));
                                    }
                                }}
                                value={address1}
                                placeholder="Enter Address 1"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.address1 && (
                                <Text style={styles.errorText}>{validationErrors.address1}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Address 2</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={setAddress2}
                                value={address2}
                                placeholder="Enter Address 2"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Area <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.area && styles.inputError]}
                                onChangeText={(text) => {
                                    setArea(text);
                                    if (validationErrors.area) {
                                        setValidationErrors(prev => ({ ...prev, area: '' }));
                                    }
                                }}
                                value={area}
                                placeholder="Enter Area"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.area && (
                                <Text style={styles.errorText}>{validationErrors.area}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Pincode <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.pincode && styles.inputError]}
                                onChangeText={handlePincodeChange}
                                value={pincode}
                                placeholder="Enter Pincode"
                                keyboardType="numeric"
                                maxLength={6}
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.pincode && (
                                <Text style={styles.errorText}>{validationErrors.pincode}</Text>
                            )}
                            {cities.length > 0 && (
                                <Text style={styles.hintText}>
                                    Available cities: {cities.join(', ')}
                                </Text>
                            )}
                        </View>

                        {renderCityInput()}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>State <Text style={styles.asterisk}>*</Text></Text>
                            <CustomPicker
                                selectedValue={selectedState}
                                onValueChange={(itemValue) => {
                                    setSelectedState(itemValue);
                                    if (validationErrors.selectedState) {
                                        setValidationErrors(prev => ({ ...prev, selectedState: '' }));
                                    }
                                }}
                                items={[
                                    { label: "Select a State", value: "" },
                                    ...states.map(state => ({ label: state, value: state }))
                                ]}
                                placeholder="Select a State"
                            />
                            {validationErrors.selectedState && (
                                <Text style={styles.errorText}>{validationErrors.selectedState}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Country <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.country && styles.inputError]}
                                onChangeText={(text) => {
                                    setCountry(text);
                                    if (validationErrors.country) {
                                        setValidationErrors(prev => ({ ...prev, country: '' }));
                                    }
                                }}
                                value={country}
                                placeholder="Enter Country"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.country && (
                                <Text style={styles.errorText}>{validationErrors.country}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mobile Number <Text style={styles.asterisk}>*</Text></Text>
                            <View style={[styles.mobileInputContainer, (validationErrors.mobile || !isMobileValid) && styles.inputError]}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput
                                    style={[styles.input, styles.mobileInput]}
                                    onChangeText={handleMobileChange}
                                    value={mobile}
                                    placeholder="Enter 10-digit Mobile Number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    placeholderTextColor={colors.fontPlaceholder}
                                />
                            </View>
                            {(validationErrors.mobile || (!isMobileValid && mobile.length > 0)) && (
                                <Text style={styles.errorText}>
                                    {validationErrors.mobile || 'Please enter a valid 10-digit mobile number starting with 6-9'}
                                </Text>
                            )}
                        </View>

                        {renderDatePicker()}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.email && styles.inputError]}
                                onChangeText={handleEmailChange}
                                value={email}
                                placeholder="Enter Email"
                                placeholderTextColor={colors.fontPlaceholder}
                                keyboardType="email-address"
                            />
                            {validationErrors.email && (
                                <Text style={styles.errorText}>{validationErrors.email}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>PAN Number <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.panNumber && styles.inputError]}
                                onChangeText={handlePANChange}
                                value={panNumber}
                                placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                                maxLength={10}
                                autoCapitalize="characters"
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.panNumber && (
                                <Text style={styles.errorText}>{validationErrors.panNumber}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Aadhaar Number <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={[styles.input, validationErrors.aadharNumber && styles.inputError]}
                                onChangeText={handleAadhaarChange}
                                value={aadharNumber}
                                placeholder="Enter 12-digit Aadhaar Number"
                                keyboardType="numeric"
                                maxLength={12}
                                placeholderTextColor={colors.fontPlaceholder}
                            />
                            {validationErrors.aadharNumber && (
                                <Text style={styles.errorText}>{validationErrors.aadharNumber}</Text>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={[styles.button, styles.backButton]} 
                                onPress={handleBack}
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
                );
            case 2:
                return (
                    <View style={styles.card}>
                        <BackHeader 
                            title="Scheme Details"
                            backPressed={() => setCurrentStep(1)}
                            style={styles.header}
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Scheme Selection</Text>
                            <View style={styles.schemeDisplay}>
                                <Text style={styles.schemeText}>
                                    {schemes.find(s => s.id === selectedSchemeId)?.name || "No scheme selected"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Amount <Text style={styles.asterisk}>*</Text></Text>
                            <CustomPicker
                                selectedValue={amount}
                                onValueChange={itemValue => {
                                    const selectedAmount = amounts.find(amt => amt.value === itemValue);
                                    setAmount(itemValue);
                                    if (selectedAmount) {
                                        setSelectedGroupcodeObj(selectedAmount.groupCode);
                                        setSelectedCurrentRegObj(selectedAmount.currentRegNo);
                                    }
                                    if (validationErrors.amount) {
                                        setValidationErrors(prev => ({ ...prev, amount: '' }));
                                    }
                                }}
                                items={amounts.map(amt => ({ label: amt.value, value: amt.value }))}
                                placeholder="Select Amount"
                                enabled={!isSubmitting}
                            />
                            {validationErrors.amount && (
                                <Text style={styles.errorText}>{validationErrors.amount}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Payment Mode <Text style={styles.asterisk}>*</Text></Text>
                            <CustomPicker
                                selectedValue={accCode}
                                onValueChange={itemValue => {
                                    setAccCode(itemValue);
                                    const selectedType = transactionTypes.find(type => type.ACCOUNT === itemValue);
                                    if (selectedType && selectedType.CARDTYPE) {
                                        setModepay(selectedType.CARDTYPE);
                                    }
                                    if (validationErrors.accCode) {
                                        setValidationErrors(prev => ({ ...prev, accCode: '' }));
                                    }
                                }}
                                items={transactionTypes.map(type => ({ label: type.NAME, value: type.ACCOUNT }))}
                                placeholder="Select Payment Mode"
                                enabled={!isSubmitting}
                            />
                            {validationErrors.accCode && (
                                <Text style={styles.errorText}>{validationErrors.accCode}</Text>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                activeOpacity={0.7}
                            >
                                {isSubmitting ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color={colors1.buttonText} />
                                        <Text style={[styles.buttonText, styles.loadingText]}>
                                            Submitting...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>Submit</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.button, styles.backButton, isSubmitting && styles.buttonDisabled]}
                                onPress={() => setCurrentStep(1)}
                                disabled={isSubmitting}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {renderStep()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors1.background,
        padding: 16,
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
    inputError: {
        borderColor: colors1.error,
    },
    inputText: {
        fontSize: 16,
        color: colors1.textPrimary,
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
        color: colors1.textPrimary,
        flex: 1,
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
        backgroundColor: colors.graycolor,
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
    },
    backButton: {
        backgroundColor: colors1.buttonSecondary,
        borderWidth: 1,
        borderColor: colors1.borderDark,
    },
    nextButton: {
        backgroundColor: colors1.buttonPrimary,
    },
    buttonText: {
        color: colors1.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        backgroundColor: colors1.primaryLight,
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: 8,
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
    placeholderText: {
        color: colors.fontPlaceholder,
        fontSize: 16,
    },
    dateText: {
        color: colors1.textPrimary,
        fontSize: 16,
    },
    schemeDisplay: {
        height: 50,
        backgroundColor: colors1.sectionBackground,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors1.borderLight,
    },
    schemeText: {
        fontSize: 16,
        color: colors1.textPrimary,
    },
    hintText: {
        color: colors1.textSecondary,
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
});

export default AddNewMember;