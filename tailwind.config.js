/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        dark: "#1F1F1F",
        soft: "#F8F9FA",
        surface: "#F8F9FA",
        "surface-hover": "#F1F3F4",
        muted: "#5F6368",
        line: "#E5E7EB"
      },
      boxShadow: {
        glow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        card: "0 1px 2px rgba(0, 0, 0, 0.04)"
      }
    }
  },
  plugins: []
};
