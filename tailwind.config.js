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
            tertiary: '#BF720C',
            green: '#95C11F',
            background: '#030303',
            placeholder: '#8391A1',
            menu: '#2D2D2D',
            inputBg: '#F7F8F9',
            inputBor: '#E8ECF4',
        },
        backgroundImage: {
          'fundo': "url('@src/assets/images/fundo.png')",
        }
        
     
      },
    },
    plugins: [],
  }