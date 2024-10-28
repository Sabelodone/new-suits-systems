/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#6a1b9a'
      }
    },
  },
  plugins: [],
}
