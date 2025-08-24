import { View, Text, Image, ScrollView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import styles from './styles';
import React, { useEffect, useState } from 'react';
import BottomTab from '../../components/BottomTab/BottomTab';
import { colors } from '../../utils';
import { TextDefault } from '../../components';
import ProductCard from '../../ui/ProductCard/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCardSkeleton from '../../components/SkeletonLoader/ProductCardSkeleton';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

function DiscoverPlace({ navigation }) {
  const [phoneSearchData, setPhoneSearchData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(true);
  const [accountDetails, setAccountDetails] = useState(null);

  const fetchAccountDetails = async (regno, groupcode) => {
    try {
      const response = await fetch(`https://akj.brightechsoftware.com/v1/api/account?regno=${regno}&groupcode=${groupcode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Account details HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAccountDetails(data);
    } catch (error) {
      console.error('Error fetching account details:', error);
      Alert.alert('Error', 'Failed to fetch account details');
    }
  };

  useEffect(() => {
    const fetchPhoneSearchData = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      console.log(storedPhoneNumber)
      try {
        const phoneResponse = await fetch(`https://akj.brightechsoftware.com/v1/api/account/phonesearch?phoneNo=${storedPhoneNumber}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!phoneResponse.ok) {
          throw new Error(`Phone Search HTTP error! status: ${phoneResponse.status}`);
        }

        const phoneJson = await phoneResponse.json();
        
        if (phoneJson && phoneJson.length > 0) {
          setPhoneSearchData(phoneJson);
          
          const productPromises = phoneJson.map(async (item) => {
            try {
              // Fetch account details for each item
              const accountResponse = await fetch(`https://akj.brightechsoftware.com/v1/api/account?regno=${item.regno}&groupcode=${item.groupcode}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });

              if (!accountResponse.ok) {
                throw new Error(`Account details HTTP error! status: ${accountResponse.status}`);
              }

              const accountData = await accountResponse.json();

              const amountWeightResponse = await fetch(
                `https://akj.brightechsoftware.com/v1/api/getAmountWeight?REGNO=${item.regno}&GROUPCODE=${item.groupcode}`, 
                {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (!amountWeightResponse.ok) {
                throw new Error(`Amount Weight HTTP error! status: ${amountWeightResponse.status}`);
              }

              const amountWeightJson = await amountWeightResponse.json();
              const isActive = !(item.maturitydate);
              const itemStatus = isActive ? 'Active' : 'Deactive';
              setStatus(itemStatus);

              return {
                ...item,
                amountWeight: amountWeightJson[0] || null,
                status: itemStatus,
                accountDetails: accountData // Pass the account data directly
              };
            } catch (amountError) {
              console.error('Error fetching data:', amountError);
              return {
                ...item,
                amountWeight: null,
                status: 'Deactive',
                accountDetails: null
              };
            }
          });
          
          const resolvedProductData = await Promise.all(productPromises);
          const validProductData = resolvedProductData.filter(item => item.amountWeight !== null);
          setProductData(validProductData);
          
          if (validProductData.length === 0) {
            setError('No valid product data found');
          }
        } else {
          setError('No phone search data available');
        }
      } catch (err) {
        console.error('Detailed fetch error:', err);
        setError(`Failed fetch data: ${err.message}`);
        Alert.alert('Fetch Error', `Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneSearchData();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/bg.jpg')}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.textBlueColor} />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Your Schemes</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollViewContentContainer}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSpacer}>
              {loading ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              ) : productData && productData.length > 0 ? (
                productData.map((item, index) => (
                  <ProductCard
                    key={index}
                    productData={item}
                    loading={loading}
                    error={error}
                    navigation={navigation}
                    status={status}
                    accountDetails={item.accountDetails}
                  />
                ))
              ) : (
                <TextDefault textColor={colors.redColor}>No products available.</TextDefault>
              )}
            </View>
          </ScrollView>

          <BottomTab screen="SCHEMES" />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

export default DiscoverPlace;
