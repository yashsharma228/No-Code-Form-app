/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fdfaf4",
          100: "#f4efe4",
          200: "#e8decb",
        },
        ink: {
          700: "#25324d",
          800: "#14213d",
          900: "#0f172a",
        },
        brand: {
          500: "#0f766e",
          600: "#125b55",
        },
        ember: {
          500: "#f97316",
          600: "#ea580c",
        },
      },
      boxShadow: {
        panel: "0 24px 48px rgba(20, 33, 61, 0.08)",
        soft: "0 16px 30px rgba(20, 33, 61, 0.08)",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-wash": "radial-gradient(circle at top left, rgba(249, 115, 22, 0.14), transparent 24%), radial-gradient(circle at right 10%, rgba(15, 118, 110, 0.12), transparent 22%)",
      },
    },
  },
  plugins: [],
};