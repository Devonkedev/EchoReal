const { typewindTransforms } = require('typewind/transform');
 
/** @type {import('tailwindcss').Config} \*/
module.exports = {
  content: {
    files: ['./src/**/*.{js,jsx,ts,tsx}'],
    transform: typewindTransforms,
  },
};