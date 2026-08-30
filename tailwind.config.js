export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0ea5e9',
        'secondary': '#1e293b',
        'accent': '#0284c7',
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
      },
      boxShadow: {
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
