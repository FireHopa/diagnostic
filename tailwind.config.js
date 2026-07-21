/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0026FF",
        dark: "#111827",
        soft: "#F3F4F6"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0, 38, 255, 0.16)",
        card: "0 18px 45px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};
