/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Import colors from centralized color file
        primary: "#223AD2", // BRAND_COLORS.PRIMARY
        secondary: "#F6A608", // BRAND_COLORS.SECONDARY
        tertiary: "#0D153A", // BRAND_COLORS.TERTIARY
        green: "#95C11F", // BRAND_COLORS.GREEN
        background: "#030303", // UI_COLORS.BACKGROUND
        placeholder: "#8391A1", // UI_COLORS.PLACEHOLDER
        menu: "#2D2D2D", // UI_COLORS.MENU
        inputBg: "#F7F8F9", // FORM_COLORS.INPUT_BG
        inputBor: "#E8ECF4", // FORM_COLORS.INPUT_BORDER
      },
    },
  },
  plugins: [],
}
