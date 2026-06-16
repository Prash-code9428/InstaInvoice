/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          cream: '#FDFBF7',
          sand: '#F4F1EA',
          charcoal: '#2D2D2D',
          sage: {
            light: '#E5ECE2',
            DEFAULT: '#7D8C77',
            dark: '#5D6C58',
          },
          amber: {
            light: '#FEF3C7',
            DEFAULT: '#D97706',
            dark: '#B45309',
          },
        },
      },
      borderRadius: {
        'cozy-sm': '0.5rem',  // 8px
        'cozy': '0.75rem',    // 12px
        'cozy-lg': '1rem',    // 16px
        'cozy-xl': '1.5rem',   // 24px
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
