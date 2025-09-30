// theme.js
import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

// Scaling functions
const guidelineBaseWidth = 350
const guidelineBaseHeight = 680
const scale = size => (width / guidelineBaseWidth) * size
const verticalScale = size => (height / guidelineBaseHeight) * size
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor

export const COLORS = {
  // Base
  background: "#FFFFFF",
  card: "#f5f0f0ff",
  surface: "#F5F5F5",
  surfaceVariant: "#EEEEEE",

  // Core Brand
  primary: "#1c467cff",
  primaryLight: "rgba(212, 175, 55, 0.15)",
  secondary: "#3A6EA5",
  notification: "#C98900",

  // Status
  success: "#2E7D32",
  danger: "#C62828",
  warning: "#FFA000",
  info: "#1565C0",

  // Text
  title: "#333333",
  text: "#222222",
  textLight: "#666666",
  label: "#757575",
  placeholder: "rgba(0, 0, 0, 0.4)",
  white: "#FFFFFF",

  // Borders & Shadows
  borderColor: "rgba(0, 0, 0, 0.1)",
  outline: "#DDDDDD",
  shadow: "rgba(0, 0, 0, 0.08)",
  overlay: "rgba(0, 0, 0, 0.3)",

  // Inputs
  input: "#F0F0F0",
  darkInput: "#E8E8E8",

  // Icons
  iconPrimary: "#C5A572",
  iconSecondary: "#888888",

  // Gradients
  gradientPrimary: ["#D4AF37", "#8C6C3F"],
  gradientSecondary: ["rgba(197,165,114,0.15)", "#D4AF37"],
  gradientText: ["#2E6F95", "#C62828"],
  gradientBackground: "linear-gradient(135deg, #F9F9F9, #FFFFFF)",
  gradientPrimary1: ["#e6e1d4ff", "#e4d9caff"],
  gradientPrimary2: ["#1c467cff", "#3A6EA5"],
  gradientPrimary3: ["#ffffffff", "#ffffffff"],
  gradientPrimary4: ["#DDDDDD", "#DDDDDD"],
  
  // Product card
  gradientcolor1: "#D4AF37",
  gradientcolor2: "#e47c1bff",

  // Gold plan
  gradientcolor3: "#D4AF37",
  gradientcolor4: "#2E7D32",

  gradientcolor5: "#1c467cff",
  gradientcolor6: "#6b9ed4ff",
};

export const SIZES = {
  // Scalable font sizes
  fontLg: moderateScale(16),
  font: moderateScale(14),
  fontSm: moderateScale(13),
  fontXs: moderateScale(12),

  // Scalable radii
  radius_sm: moderateScale(8),
  radius: moderateScale(12),
  radius_lg: moderateScale(16),

  // Scalable spacing
  padding: moderateScale(16),
  margin: moderateScale(16),

  // Scalable headings
  h1: moderateScale(32),
  h2: moderateScale(28),
  h3: moderateScale(24),
  h4: moderateScale(20),
  h5: moderateScale(18),
  h6: moderateScale(16),

  // App dimensions
  width,
  height,
  container: moderateScale(800),
};

export const FONTS = {
  // Paragraph styles with scaling
  fontLg: {
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    lineHeight: moderateScale(24),
    fontFamily: "TimesNewRoman",
  },
  font: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: moderateScale(20),
    fontFamily: "TimesNewRoman",
  },
  fontSm: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    lineHeight: moderateScale(18),
    fontFamily: "TimesNewRoman",
  },
  fontXs: {
    fontSize: SIZES.fontXs,
    color: COLORS.text,
    lineHeight: moderateScale(16),
    fontFamily: "TimesNewRoman",
  },

  // Scalable headings
  h1: {
    fontSize: SIZES.h1,
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: moderateScale(40),
  },
  h2: {
    fontSize: SIZES.h2,
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: moderateScale(36),
  },
  h3: {
    fontSize: SIZES.h3,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(32),
  },
  h4: {
    fontSize: SIZES.h4,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(28),
  },
  h5: {
    fontSize: SIZES.h5,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(26),
    color: COLORS.title,
  },
  h6: {
    fontSize: SIZES.h6,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(24),
  },

  // Custom semantic roles
  heading: {
    fontFamily: "TrajanProBold",
    lineHeight: moderateScale(25),
  },
  subheading: {
    fontFamily: "DMSerif",
    fontWeight: "500",
  },
  body: {
    fontFamily: "DancingScript",
    fontWeight: "600",
  },
  body1: {
    fontFamily: "Domine",
    fontWeight: "500",
  },
  fancy: {  
    fontFamily: "Fancy",
    // fontWeight: "700",
  },
};

// Export scaling functions
export { scale, verticalScale, moderateScale }

const appTheme = { COLORS, SIZES, FONTS,  scale, verticalScale, moderateScale }

export default appTheme;