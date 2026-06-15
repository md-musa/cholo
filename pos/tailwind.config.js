/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "sf-regular": ["SFPRODISPLAYREGULAR", "sans-serif"],
        "sf-medium": ["SFPRODISPLAYMEDIUM", "sans-serif"],
        "sf-bold": ["SFPRODISPLAYBOLD", "sans-serif"],
        "sf-black-italic": ["SFPRODISPLAYBLACKITALIC", "sans-serif"],
        "sf-heavy-italic": ["SFPRODISPLAYHEAVYITALIC", "sans-serif"],
        "sf-light-italic": ["SFPRODISPLAYLIGHTITALIC", "sans-serif"],
        "sf-semi-bold-italic": ["SFPRODISPLAYSEMIBOLDITALIC", "sans-serif"],
        "sf-thin-italic": ["SFPRODISPLAYTHINITALIC", "sans-serif"],
        "sf-ultra-light-italic": ["SFPRODISPLAYULTRALIGHTITALIC", "sans-serif"],
      },
      fontSize: {
        "large-title": "34px", // Title size as bold 34px
        "title-1": "28px", // Title size as bold 34px
        "title-2": "22px", // Title size as bold 34px
        "title-3": "20px", // Title size as bold 34px
        headline: "20px", // Heading size as bold 24px
        body: "17px", // Heading size as bold 24px
        subhead: "15px", // Heading size as bold 24px
        footnote: "13px", // Heading size as bold 24px
      },
      colors: {
        primary: {
          50: "#f0fdf9", // Lightest (5%)
          100: "#d1faec", // Very light
          200: "#a5f3da", // Light
          300: "#6ee7c5", // Medium-light
          400: "#34d3ac", // Slightly lighter than base
          500: "#00C89B", // Your base color (MAIN)
          600: "#00a380", // Slightly darker
          700: "#008068", // Medium-dark
          800: "#006550", // Dark
          900: "#004d3d", // Darkest (90%)
        },
        secondary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // primary:{
        //   50: "#00C89B0D",
        //   100: "#00C89B1A",
        //   200: "#00C89B33",
        //   300: "#00C89B4D",
        //   400: "#00C89B66",
        //   500: "#00C89B80",
        //   600: "#00C89B99",
        //   700: "#00C89BB3",
        //   800: "#00C89BCC",
        //   900: "#00C89B",
        // },
        // secondary: {
        //   50: "#8D0FC01A",
        //   100: "#8D0FC033",
        //   200: "#8D0FC04D",
        //   300: "#8D0FC066",
        //   400: "#8D0FC080",
        //   500: "#8D0FC099",
        //   600: "#8D0FC0B3",
        //   700: "#8D0FC0CC",
        //   800: "#8D0FC0E6",
        //   900: "#8D0FC0",
        // },
        tertiary: {
          50: "#24204D0D",
          100: "#24204D1A",
          200: "#24204D33",
          300: "#24204D4D",
          400: "#24204D66",
          500: "#24204D80",
          600: "#24204D99",
          700: "#24204DB3",
          800: "#24204DCC",
          900: "#24204DE6",
        },
        muted: {
          50: "#f9fafb", // bg-gray-50
          100: "#f3f4f6", // bg-gray-100
          200: "#e5e7eb", // bg-gray-200
          300: "#d1d5db", // bg-gray-300
          400: "#9ca3af", // bg-gray-400
          500: "#6b7280", // bg-gray-500 (base muted color)
          600: "#4b5563", // bg-gray-600
          700: "#374151", // bg-gray-700
          800: "#1f2937", // bg-gray-800
          900: "#111827", // bg-gray-900
        },
      },
    },
  },
  plugins: [],
};
