/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F11958", // Hot Pink - Main button, Active state
        secondary: "#FB7736", // Yellow/Orange - Kakao button, Location chips
        mint: "#6FE0CE", // Category chips
        purple: "#B63E93", // Member count chips
        gray: {
          light: "#B7B7B7", // Inactive state, Placeholder
          dark: "#1F1F1F", // Text, Dark background
        },
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
}
