const { typewindTransforms } = require('typewind/transform');
 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    transform: typewindTransforms,
  },
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};