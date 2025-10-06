import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ToastAndroid,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTab, TextDefault, Slider } from "../../components";
import GoldPlan from "../../ui/ProductCard/GoldPlans";
import ProductCard from "../../ui/ProductCard/ProductCard";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import { colors1 } from "../../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCardSkeleton from "../../components/SkeletonLoader/ProductCardSkeleton";
import GoldPlansSkeleton from "../../components/SkeletonLoader/GoldPlansSkeleton";
import MainPageWithYouTube from "../Youtube/Youtube";
import MainHeader from "../../components/MainHeader/MainHeader";

// Constants
const API_BASE_URL = "https://akj.brightechsoftware.com/v1/api";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// API Endpoints
const API_ENDPOINTS = {
  phoneSearch: (phoneNo) =>
    `${API_BASE_URL}/account/phonesearch?phoneNo=${phoneNo}`,
  account: (regno, groupcode) =>
    `${API_BASE_URL}/account?regno=${encodeURIComponent(
      regno
    )}&groupcode=${encodeURIComponent(groupcode)}`,
  amountWeight: (regno, groupcode) =>
    `${API_BASE_URL}/getAmountWeight?REGNO=${encodeURIComponent(
      regno
    )}&GROUPCODE=${encodeURIComponent(groupcode)}`,
  schemes: `${API_BASE_URL}/member/scheme`,
};

// Utility Functions
const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

// Custom Hook for API Fetching
const useFetchWithError = () => {
  const fetchData = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }, []);

  return fetchData;
};

// Swipeable Cards Component
const SwipeableCards = React.memo(
  ({
    data,
    loading,
    error,
    renderItem,
    renderSkeleton,
    emptyMessage,
    cardWidth = SCREEN_WIDTH * 0.9,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const onMomentumScrollEnd = (event) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / cardWidth);
      setCurrentIndex(index);
    };

    if (loading) {
      return (
        <View style={styles.swipeableContainer}>
          <FlatList
            data={Array(3).fill()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={[styles.cardWrapper, { width: cardWidth }]}>
                {renderSkeleton(index)}
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      );
    }

    if (error || data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <TextDefault textColor={colors1.error}>
            {error || emptyMessage}
          </TextDefault>
        </View>
      );
    }

    return (
      <View style={styles.swipeableContainer}>
        <FlatList
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item, index }) => (
            <View style={[styles.cardWrapper, { width: cardWidth }]}>
              {renderItem(item, index)}
            </View>
          )}
          keyExtractor={(item, index) =>
            item.regno && item.groupcode
              ? `${item.regno}-${item.groupcode}-${index}`
              : item.schemeId
              ? `${item.schemeId}-${index}`
              : index.toString()
          }
          decelerationRate="fast"
          snapToInterval={cardWidth}
          snapToAlignment="center"
        />

        {/* Pagination Dots */}
        {data.length > 1 && (
          <View style={styles.paginationContainer}>
            {data.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? colors1.primary
                        : colors1.lightGray,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

// Section Header Component
const SectionHeader = React.memo(({ title, onViewAll }) => (
  <View style={styles.sectionHeaderContainer}>
    <TextDefault textColor={colors1.primaryText} style={styles.titletext}>
      {title}
    </TextDefault>
    <TouchableOpacity onPress={onViewAll}>
      <TextDefault textColor={colors1.primary} H5 style={styles.viewAllText}>
        View All
      </TextDefault>
    </TouchableOpacity>
  </View>
));

// Main Component
function MainLanding() {
  const navigation = useNavigation();
  const fetchData = useFetchWithError();

  // State Management
  const [schemes, setSchemes] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Schemes
  const fetchSchemes = useCallback(async () => {
    try {
      const data = await fetchData(API_ENDPOINTS.schemes);
      setSchemes(
        data.map((s) => ({
          schemeId: s.SchemeId,
          schemeName: s.schemeName,
          description: s.SchemeSName,
        }))
      );
    } catch (error) {
      console.error("Error fetching schemes:", error);
      showToast("Failed to fetch schemes");
    }
  }, [fetchData]);

  // Fetch Product Data
const fetchProductData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // 1️⃣ Get stored phone number
    const storedPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
    if (!storedPhoneNumber) throw new Error("Phone number not found");

    // 2️⃣ Fetch phone data
    const phoneData = await fetchData(API_ENDPOINTS.phoneSearch(storedPhoneNumber));
    // console.log("Phone Data:", phoneData);

    if (!phoneData || phoneData.length === 0) {
      setError("No schemes found for this account");
      setProductData([]);
      return;
    }

    // 3️⃣ For each phone entry, fetch account & amountWeight
    const productPromises = phoneData.map(async (item) => {
      const regno = item.regno;
      const groupcode = item.groupcode;

      if (!regno || !groupcode) return null;

      try {
        const [accountData, amountWeightData] = await Promise.all([
          fetchData(API_ENDPOINTS.account(regno, groupcode)),
          fetchData(API_ENDPOINTS.amountWeight(regno, groupcode)),
        ]);

        // ✅ Log API results
        // console.log(`Account Data for ${regno}-${groupcode}:`, accountData);
        // console.log(`AmountWeight Data for ${regno}-${groupcode}:`, amountWeightData);

        const maturityDate = item.maturityDate ? new Date(item.maturityDate) : null;
        const isActive = maturityDate !== null;
        const itemStatus = isActive ? "Active" : "Deactive";

        const amountWeight = amountWeightData?.[0] ?? { Weight: 0, Amount: 0 };

        return {
          ...item,
          amountWeight,
          status: itemStatus,
          accountDetails: accountData,
        };
      } catch (err) {
        console.error(`Error fetching account/amountWeight for ${regno}-${groupcode}:`, err);
        return null;
      }
    });

    const resolvedData = await Promise.all(productPromises);
    const validData = resolvedData.filter(Boolean);

    setProductData(validData);

    if (validData.length === 0) {
      setError("No valid schemes found");
    }

    // console.log("Final Product Data:", validData);
  } catch (err) {
    console.error("Error in fetchProductData:", err);
    setError(err.message);
    showToast(`Failed to load data: ${err.message}`);
  } finally {
    setLoading(false);
  }
}, [fetchData]);


  // Initial Data Fetch
  useEffect(() => {
    fetchSchemes();
    fetchProductData();
  }, [fetchSchemes, fetchProductData]);

  // Refresh on Focus
  useFocusEffect(
    useCallback(() => {
      fetchProductData();
    }, [fetchProductData])
  );

  // Render Header Content
  const renderHeaderContent = useCallback(
    () => (
      <>
      
        <MainHeader
          style={[{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1 }]}
        />

        <Slider />

        {/* Welcome Section */}
        <View style={styles.contentWrapper}>
          <Text style={styles.contentText}>
            Welcome to the Digital home of BMG Jewellers:
          </Text>
          <Text style={styles.contentText1}>
            The ideal place to join a savings scheme and save up to buy your
            dream jewels. BMG DIGIGOLD empowers you to save and buy jewels
            conveniently in the palm of your hand. Start saving in gold from
            today.
          </Text>
        </View>

        {/* Your Schemes Section */}
        <View style={styles.titleSpacer}>
          <SectionHeader
            title="Your Schemes"
            onViewAll={() => navigation.navigate("MyScheme")}
          />

          <SwipeableCards
            data={productData}
            loading={loading}
            error={error}
            emptyMessage="No Schemes available."
            renderItem={(item, index) => (
              <ProductCard
                productData={item}
                loading={false}
                status={item.status}
                error={null}
                navigation={navigation}
                accountDetails={item.accountDetails}
              />
            )}
            renderSkeleton={(index) => <ProductCardSkeleton key={index} />}
          />
        </View>

        {/* Gold Plans Info */}
        <View style={styles.contentWrapper}>
          <Text style={styles.contentText}>Customized Gold Plans for You:</Text>
          <Text style={styles.contentText1}>
            Choose from a range of Gold Plans with unique benefits to suit your
            needs and convenience.
          </Text>
        </View>

        {/* Gold Plans Section */}
        <View style={[styles.titleSpacer, { flex: 1 }]}>
          <SectionHeader
            title="Gold Plans"
            onViewAll={() => navigation.navigate("GoldPlanScreen")}
          />

          <SwipeableCards
            data={schemes}
            loading={loading}
            error={null}
            emptyMessage="No Gold Plans available."
            renderItem={(scheme, index) => (
              <GoldPlan
                schemeId={scheme.schemeId}
                schemeName={scheme.schemeName}
                description={scheme.description}
                styles={styles.itemCardContainer}
              />
            )}
            renderSkeleton={(index) => <GoldPlansSkeleton key={index} />}
            cardWidth={SCREEN_WIDTH * 0.75}
          />
        </View>

        {/* YouTube Section */}
        <View style={styles.youtubeContainer}>
          <View style={styles.youtubeWrapper}>
            <TextDefault
              textColor={colors1.primaryText}
              style={styles.titletext}
            >
              Promotions & Offers
            </TextDefault>
          </View>
          <MainPageWithYouTube />
        </View>
      </>
    ),
    [navigation, loading, productData, error, schemes]
  );

  return (
    <View style={[styles.flex, styles.safeAreaStyle]}>
      <ImageBackground
        source={require("../../assets/bg4.jpg")}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <FlatList
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeaderContent}
          data={[]}
          renderItem={null}
        />
        <BottomTab screen="HOME" />
      </ImageBackground>
    </View>
  );
}

export default MainLanding;
