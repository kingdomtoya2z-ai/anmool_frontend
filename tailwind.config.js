/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette matched to the Anmool logo:
        // Primary green #63A822 (leaf), secondary blue #092959 (logo text).
        // DhenuVera keeps its own maroon identity via the `dhenu` palette.
        primary: {
          DEFAULT: '#63A822',
          light: '#8BC53F',
          dark: '#3E6B12',
        },
        accent: {
          DEFAULT: '#63A822',
          light: '#8BC53F',
          dark: '#4A7D17',
        },
        cream: '#EFF2F7',
        dairy: {
          50: '#F0F7E6',
          100: '#DDEDC7',
        },
        // Logo derived neutrals
        logo: {
          navy: '#092959',
          green: '#63A822',
          slate: '#576D8E',
          steel: '#919FB5',
          charcoal: '#2A2928',
          light: '#EFF0F0',
          beige: '#F2EBE5',
        },
        // Sacred greens + logo blue secondary (site-wide theme)
        sacred: {
          maroon: '#2E5A0E',
          deepmaroon: '#142808',
          saffron: '#1A4580',
          flame: '#63A822',
          diya: '#FFC53D',
          sandal: '#EFF4E6',
          sandalwood: '#D9E6C6',
          smoke: '#8A7F72',
          ash: '#B8AEA0',
        },
        // DhenuVera keeps its original maroon/saffron identity
        dhenu: {
          maroon: '#5C1A1B',
          deepmaroon: '#3B0F10',
          saffron: '#E8851A',
          flame: '#F5A524',
          diya: '#FFC53D',
          sandal: '#F3E7CF',
        },
        smoke: {
          50: '#FAF8F5',
          100: '#F1ECE4',
          200: '#E2D8C8',
        },
      },
      fontFamily: {
        sans: ['Mukta', 'Poppins', 'Arial', 'Helvetica', 'sans-serif'],
        serif: ['Marcellus', '"Cormorant Garamond"', 'Georgia', 'serif'],
        poppins: ['Poppins', 'Arial', 'Helvetica', 'sans-serif'],
        sacred: ['Marcellus', '"Cormorant Garamond"', 'Georgia', 'serif'],
        vedic: ['"Cormorant Garamond"', 'Marcellus', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
