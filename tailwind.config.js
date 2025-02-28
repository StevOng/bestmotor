/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./myapp/templates/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        customBlue: "#3D5A80",
      },
    },
  },
  plugins: [],
};
