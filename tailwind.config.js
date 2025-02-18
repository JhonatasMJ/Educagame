/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: { 
            primary: '#3185BE',
            secondary: '#F6A608',
            background: '#030303',
            placeholder: '#8391A1',
            inputBg: '#F7F8F9',
            inputBor: '#E8ECF4'
        }
        
     
      },
    },
    plugins: [],
  }