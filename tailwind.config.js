export default {
  content: [
    "./styles/index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enables toggling dark mode using a class
  theme: {
    extend: {
      colors: {
        bg_primary: "#8a63ff",
        bg_secondary: "#ffc3b6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
}
