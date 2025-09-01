import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
  ActivityIndicator
} from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#CD865C',
  primaryDark: '#B35F34',
  primaryLight: '#E8B79D',
  background: '#FFF9F6',
  shadow: 'rgba(179, 95, 52, 0.3)',
  cardBackground: '#FFFFFF',
};

// Define your desired fallback URLs
const FALLBACK_BANNERS = [
  {
    id: 1,
    image_path: '/images/banner1.jpg',
    url: 'https://bmgjewellers.com/shop-left?itemName=EARRINGS'
  },
  {
    id: 2,
    image_path: '/images/banner2.jpg',
    url: 'https://bmgjewellers.com/shop-left?itemName=NECKLACES'
  },
  {
    id: 3,
    image_path: '/images/banner3.jpg',
    url: 'https://bmgjewellers.com/shop-left?itemName=FESTIVAL'
  }
];

export default function EnhancedSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('https://app.bmgjewellers.com/api/v1/App_banner/list');
        const data = await response.json();
        
        // console.log('API Response:', data); // Debug log
        
        // Map API data to use your desired fallback URLs
        const bannersWithUrls = data.map((banner, index) => {
          // Use the corresponding fallback URL based on index
          const fallbackBanner = FALLBACK_BANNERS[index] || FALLBACK_BANNERS[0];
          
          return {
            ...banner,
            // Use the URL from fallback banners, not from API
            url: fallbackBanner.url,
            // Make sure we use the correct image path from API
            image_path: banner.image_path
          };
        });
        
        // console.log('Processed banners:', bannersWithUrls); // Debug log
        setBanners(bannersWithUrls);
      } catch (error) {
        console.error('Error fetching banners:', error);
        
        // Use fallback data in case API fails
        // console.log('Using fallback banners:', FALLBACK_BANNERS);
        setBanners(FALLBACK_BANNERS);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (!banners.length) return;
    startAutoScroll();
    return () => stopAutoScroll();
  }, [banners, currentIndex, isAutoScrolling]);

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isAutoScrolling && banners.length > 0) {
        const nextIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
        scrollToIndex(nextIndex);
      }
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const onScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleBannerPress = (url) => {
    console.log('Opening URL:', url); // Debug log
    // Directly open the URL in the device's browser
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const renderSliderItem = ({ item }) => {
    const imageUrl = `https://app.bmgjewellers.com${item.image_path}`;
    // console.log('Image URL:', imageUrl, 'Target URL:', item.url); // Debug log
    
    return (
      <TouchableOpacity
        style={styles.sliderItem}
        activeOpacity={0.9}
        onPress={() => handleBannerPress(item.url)}
      >
        <Animated.View style={styles.imageContainer}>
          <Image
            style={styles.sliderImage}
            source={{ uri: imageUrl }}
            resizeMode="cover"
            onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
          />
          <View style={styles.overlay} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [1, 1.3, 1],
          extrapolate: 'clamp'
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.5, 1, 0.5],
          extrapolate: 'clamp'
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
              { transform: [{ scale }], opacity }
            ]}
          />
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderSliderItem}
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={() => {
          setIsAutoScrolling(false);
          stopAutoScroll();
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            setIsAutoScrolling(true);
            startAutoScroll();
          }, 3000);
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      {banners.length > 1 && renderPaginationDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginVertical: 10,
    position: 'relative',
  },
  sliderItem: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  imageContainer: {
    width: '95%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backgroundColor: colors.cardBackground,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 16,
    borderRadius: 8,
  },
});