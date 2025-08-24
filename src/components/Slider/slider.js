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

export default function EnhancedSlider({ navigation }) {
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
        
        // If your API doesn't return URLs, you can add them here
        // For demonstration, I'm adding sample URLs
        const bannersWithUrls = data.map((banner, index) => ({
          ...banner,
          // Use the URL from API if available, otherwise use these sample URLs
          url: banner.url || `https://bmgjewellers.com/${index === 0 ? 'collections' : index === 1 ? 'new-arrivals' : 'sale'}`
        }));
        
        setBanners(bannersWithUrls);
      } catch (error) {
        console.error('Error fetching banners:', error);
        
        // Fallback data in case API fails
        const fallbackBanners = [
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
        setBanners(fallbackBanners);
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
    // You can use either external linking or internal navigation
    // Option 1: Open external URL
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    
    // Option 2: Navigate internally (if you have set up navigation)
    // For example, if you have a WebView screen:
    // navigation.navigate('BannerWebView', { url });
    
    // Option 3: Navigate to different screens based on URL
    // if (url.includes('collections')) {
    //   navigation.navigate('Collections');
    // } else if (url.includes('new-arrivals')) {
    //   navigation.navigate('NewArrivals');
    // } else if (url.includes('sale')) {
    //   navigation.navigate('Sale');
    // }
  };

  const renderSliderItem = ({ item }) => {
    const imageUrl = `https://app.bmgjewellers.com${item.image_path}`;
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