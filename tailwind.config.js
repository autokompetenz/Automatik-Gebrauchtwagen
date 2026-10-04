export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        red:    { DEFAULT: '#132853', dark: '#0E1E3D', light: '#1E3A6E' },
        dark:   { DEFAULT: '#111112', 2: '#18181A', 3: '#222224' },
        chrome: { DEFAULT: '#F0F0F0', dim: '#8A8A90' },
        surface:'#2A2A2D',
      },
      fontFamily: {
        sans:  ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
