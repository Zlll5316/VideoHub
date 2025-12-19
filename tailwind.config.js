/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          'purple-glow': 'rgba(139, 92, 246, 0.3)',
          'blue-glow': 'rgba(59, 130, 246, 0.3)',
        },
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
        'glow-purple-strong': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
        'glow-blue-strong': '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)',
        'card-soft': '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 1px rgba(139, 92, 246, 0.1)',
        'card-lift': '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        'gradient-purple-strong': 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
      },
    },
  },
  plugins: [],
}
