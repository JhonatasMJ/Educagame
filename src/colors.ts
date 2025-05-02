/**
 * Centralized color variables for the Educagame application
 * This file contains all color definitions used throughout the app
 */

// Main brand colors
export const BRAND_COLORS = {
  /** Primary brand color - Used for primary buttons, accents, and highlights */
  PRIMARY: "#223AD2",
  /** Secondary brand color - Used for headers, secondary buttons */
  SECONDARY: "#F6A608",
  /** Tertiary brand color - Used for backgrounds, navigation elements */
  TERTIARY: "#0D153A",
  /** Green brand color - Used for success states, progress indicators */
  GREEN: "#95C11F",
}

// UI element colors
export const UI_COLORS = {
  /** Background color for dark screens */
  BACKGROUND: "#030303",
  /** Placeholder text color */
  PLACEHOLDER: "#8391A1",
  /** Menu background color */
  MENU: "#2D2D2D",
  /** Input field background color */
  INPUT_BG: "#F7F8F9",
  /** Input field border color */
  INPUT_BORDER: "#E8ECF4",
}

// Text colors
export const TEXT_COLORS = {
  /** Primary text color */
  PRIMARY: "#000000",
  /** Secondary text color */
  SECONDARY: "#4B5563",
  /** Light text color for dark backgrounds */
  LIGHT: "#FFFFFF",
  /** Gray text color for less emphasis */
  GRAY: "#6B7280",
  /** Error text color */
  ERROR: "#FF0000",
}

// State colors
export const STATE_COLORS = {
  /** Success state color */
  SUCCESS: "#22C55E",
  /** Error state color */
  ERROR: "#EF4444",
  /** Warning state color */
  WARNING: "#F59E0B",
  /** Info state color */
  INFO: "#3B82F6",
}

// Button colors
export const BUTTON_COLORS = {
  /** Primary button background */
  PRIMARY_BG: BRAND_COLORS.PRIMARY,
  /** Primary button text */
  PRIMARY_TEXT: "#FFFFFF",
  /** Secondary button background */
  SECONDARY_BG: BRAND_COLORS.SECONDARY,
  /** Secondary button text */
  SECONDARY_TEXT: "#FFFFFF",
  /** Disabled button background */
  DISABLED_BG: "#E5E7EB",
  /** Disabled button text */
  DISABLED_TEXT: "#9CA3AF",
}

// Form colors
export const FORM_COLORS = {
  /** Input background */
  INPUT_BG: UI_COLORS.INPUT_BG,
  /** Input border */
  INPUT_BORDER: UI_COLORS.INPUT_BORDER,
  /** Input border when focused */
  INPUT_BORDER_FOCUS: "#223AD2",
  /** Input border when error */
  INPUT_BORDER_ERROR: STATE_COLORS.ERROR,
  /** Label text */
  LABEL: TEXT_COLORS.SECONDARY,
}

// Export a default object with all color categories
export default {
  brand: BRAND_COLORS,
  ui: UI_COLORS,
  text: TEXT_COLORS,
  state: STATE_COLORS,
  button: BUTTON_COLORS,
  form: FORM_COLORS,
}
