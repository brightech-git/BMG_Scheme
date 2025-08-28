import { Dimensions, StyleSheet } from 'react-native'
import {
  alignment,
  colors,
  scale,
  verticalScale
} from '../../utils'
import { colors1 } from '../../utils/colors'

const { height, width } = Dimensions.get('window')

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safeAreaStyle: {
    backgroundColor: 'transparent',
  },
  mainBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  flatListStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImageStyle: {
    opacity: 0.9,
  },
  
  // Enhanced Header Styles with modern colors1 theme
  headerContainer1: {
    backgroundColor: colors1.headerBackground, // Using your primary color
    paddingBottom: verticalScale(25),
    borderBottomLeftRadius: scale(25),
    borderBottomRightRadius: scale(25),
    elevation: 8,
    shadowColor: colors1.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Add gradient effect simulation with overlay
    position: 'relative',
  },

  // Top section with FAQ and Menu icons
  topHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(5),
  },

  faqIconContainer: {
    backgroundColor: colors1.accent, // Modern accent color
    borderRadius: scale(25),
    padding: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  menuIconContainer: {
    backgroundColor: colors1.accent, // Modern accent color
    borderRadius: scale(25),
    padding: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Main header section with logo and company name
  mainHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(-20),
  },

  logoContainer: {
    marginRight: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.53)',
    borderRadius: scale(30),
    padding: scale(1),
  },

  headerLogo: {
    width: scale(60),
    height: scale(60),
  },

  companyNameContainer: {
    alignItems: 'center',
  },

  companyName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors1.primaryText,
    letterSpacing: 1,
  },

  companySubtitle: {
    fontSize: scale(14),
   color: colors1.primaryText,
    fontWeight: '600',
    marginTop: verticalScale(2),
  },

  // Rate timestamp
  rateTimestampContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(5),
  },

  rateTimestamp: {
    fontSize: scale(12),
    color: colors1.textPrimary, // White text
    fontWeight: '500',
    opacity: 0.85,
    textShadowColor: colors1.primaryDark,
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },

  // Rate cards container
  rateCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    marginTop: verticalScale(15),
  },

  rateCard: {
    flex: 1,
    backgroundColor: colors1.cardBackground, // Clean white background
    borderRadius: scale(16),
    marginHorizontal: scale(6),
    padding: scale(15),
    elevation: 6,
    shadowColor: colors1.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: colors1.borderLight, // Subtle border
  },

  rateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rateIconContainer: {
    marginRight: scale(10),
  },

  animatedCoinContainer: {
    height: scale(35),
    width: scale(35),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: scale(17.5),
    overflow: 'hidden',
    transform: [{ perspective: 1000 }]
  },

  rateCoinIcon: {
    width: scale(25),
    height: scale(25),
    resizeMode: 'contain'
  },

  rateTextContainer: {
    flex: 1,
  },

  rateLabel: {
    fontSize: scale(12),
    color: '#666',
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },

  rateValue: {
    fontSize: scale(16),
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: verticalScale(1),
  },

  rateUnit: {
    fontSize: scale(10),
    color: '#888',
    fontWeight: '500',
  },

  // Section headers
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },

  titletext: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors1.primaryText,
    letterSpacing: 1,
  },

  viewAllText: {
    textAlign: 'right',
    marginRight: scale(20),
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors1.primaryText,
    letterSpacing: 1,
  },

  // Rest of the existing styles (keeping them as they were)
  leftIconPadding: {
    ...alignment.PLsmall,
    ...alignment.PRlarge
  },
  scrollViewStyle: {
    marginTop: verticalScale(20),
    backgroundColor: colors.themeBackground
  },
  grayBackground: {
    backgroundColor: colors.white
  },
  caroselContainer: {
    width: '100%',
    height: height * 0.3,
    position: 'relative',
    padding: 10,
    borderRadius: scale(70),
    overflow: 'hidden',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(-16),
    alignItems: 'center',
  },
  caroselStyle: {
    width,
    height: height * 0.3,
    borderRadius: scale(70),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
  },
  headercontainer1: {
    backgroundColor: colors1.headerBackground,
  },
  locationWrapper: {
    alignItems: 'flex-start',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00000',
    marginLeft: scale(5),
    marginRight: scale(5),
  },
  notificationIcon: {
    marginLeft: scale(5),
    padding: scale(10)
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#808080',
    marginBottom: verticalScale(5),
    padding: scale(7)
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scale(15),
    marginLeft: scale(0)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(10),
    marginHorizontal: scale(20),
    marginTop: verticalScale(10),
    padding: scale(13),
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    color: '#000',
    fontSize: 18,
  },
  menuDrawerContainer: {
    position: 'absolute',
    top: '10%',
    left: '2%'
  },
  imgResponsive: {
    flex: 1,
    width: undefined,
    height: undefined
  },
  headingText: {
    fontSize: scale(16)
  },
  itemCardContainer: {
    width: scale(290),
    height: scale(220),
    ...alignment.MTsmall,
    ...alignment.MRlarge
  },
  productgoldContainer: {
    paddingLeft: scale(10),
  },
  iconContainer: {
    width: scale(60),
    height: verticalScale(60),
    marginRight: scale(27),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(40),
    overflow: 'hidden',
    backgroundColor: '#E0F8FF',
    marginTop: scale(16)
  },
  iconImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  categoryContainer: {
    marginTop: verticalScale(10),
    paddingHorizontal: scale(10),
  },
  titleSpacer: {
    marginLeft: '5%',
    marginTop: scale(10)
  },
  productCard: {
    marginLeft: '5%',
    width: '43%',
    height: scale(200),
    marginTop: scale(10),
    marginBottom: scale(20),
    borderColor: colors.whiteColor,
    borderWidth: scale(8),
  },
  productScrollContainer: {
    marginTop: verticalScale(10),
  },
  seeAllTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: 15
  },
  locationImage: {
    width: 84,
    height: 54,
    marginRight: 8,
  },
  seeAllText: {
    textAlign: 'right',
    marginRight: '6%',
    marginTop: scale(-35),
  },
  spacer: {
    ...alignment.MBsmall
  },
  categoryWrapper: {
    alignItems: 'center',
    marginRight: scale(17),
    padding: 0,
    marginLeft: scale(-6),
  },
  container: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors1.primaryText,
    marginLeft: 10
  },
  titlecard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.greenColor,
    marginLeft: '5%',
  },
  trendingContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.containerDark,
    borderRadius: 10,
    padding: 20,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    color: colors.greenColor,
    fontSize: 16,
    marginLeft: '5%',
  },
  subtitle1: {
    color: colors.greenColor,
    fontSize: 11,
    marginLeft: '5%',
  },
  logo: {
    width: 30,
    height: 30,
    marginBottom: 10,
    marginRight: 10,
    resizeMode: 'contain'
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateUpdatedText: {
    fontSize: 16,
    color: colors1.textPrimary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  contentWrapper: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(15),
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(18),
    backgroundColor: colors1.sectionBackground, // Modern section background
    borderRadius: scale(15),
    elevation: 4,
    shadowColor: colors1.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    borderWidth: 1,
    borderColor: colors1.borderLight,
  },
  contentText: {
    color: colors1.primaryText, // Modern primary text color
    fontSize: scale(16),
    fontWeight: '700',
    marginVertical: verticalScale(8),
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  contentText1: {
    color: colors1.textSecondary, // Modern secondary text
    fontSize: scale(13),
    lineHeight: scale(20),
    fontWeight: '500',
    opacity: 0.9,
  },
  animatedContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
    transform: [{ perspective: 1000 }]
  },
  youtubeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(-30),
  },

})

export default styles