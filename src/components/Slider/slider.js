import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Animated
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Enhanced slider data with more information
const SLIDER_DATA = [
  {
    id: 1,
    image: require('../../assets/slider11.jpg'),
  },
  {
    id: 2,
    image: require('../../assets/slider22.jpg'),
  },
  {
    id: 3,
    image: require('../../assets/slider33.jpg'),
  },
];

// Modern colors based on your color scheme
const colors = {
  primary: '#CD865C',
  primaryDark: '#B35F34',
  primaryLight: '#E8B79D',
  accent: '#FFB699',
  highlight: '#FFD1B3',
  textLight: '#FFFFFF',
  textDark: '#041f60',
  background: '#FFF9F6',
  shadow: 'rgba(179, 95, 52, 0.3)',
  cardBackground: '#FFFFFF',
  sectionBackground: '#FBEFE9'
};

export default function EnhancedSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  // Auto-scroll functionality
  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (isAutoScrolling) {
        const nextIndex = currentIndex === SLIDER_DATA.length - 1 ? 0 : currentIndex + 1;
        scrollToIndex(nextIndex);
      }
    }, 4000); // 4 seconds for better UX
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Smooth scroll to index
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index, 
        animated: true,
        viewPosition: 0.5
      });
      setCurrentIndex(index);
      
      // Animate content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  // Handle manual scroll
  const onScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Start/stop auto-scroll based on component lifecycle
  useEffect(() => {
    startAutoScroll();
    
    return () => stopAutoScroll();
  }, [currentIndex, isAutoScrolling]);

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const renderSliderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp'
    });
    
    return (
      <TouchableOpacity 
        style={styles.sliderItem}
        activeOpacity={0.9}
        onPress={() => {
          // Handle slide tap - you can navigate or show details
          console.log('Slider item pressed:', item.id);
        }}
      >
        <Animated.View 
          style={[
            styles.imageContainer,
            {
              opacity,
              transform: [{ scale }]
            }
          ]}
        >
          <Image 
            style={styles.sliderImage} 
            source={item.image}
            resizeMode="cover"
          />
          
          {/* Semi-transparent overlay for better visual effect */}
          <View style={styles.overlay} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {SLIDER_DATA.map((_, index) => {
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
              {
                transform: [{ scale }],
                opacity
              }
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDER_DATA}
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
      
      {/* Enhanced Pagination Dots with animations */}
      {renderPaginationDots()}
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  
  // Enhanced Pagination Dots
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