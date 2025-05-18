export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enables toggling dark mode using a class
  theme: {
    extend: {
      colors: {
        cyan: "#1AB2B9",
        fuchsia: "#FFE4FF",
        background: "#1F2937",
        text: "#F9FAFB"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
}
