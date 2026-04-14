/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        steel: {
          100: "#f1f5f9",
          500: "#64748b",
          600: "#475569",
        },
      },
    },
  },
  plugins: [],
};
