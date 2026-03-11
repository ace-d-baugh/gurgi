/** @type {import('tailwindcss').Config} */
export default {
 content: [
 "./index.html",
 "./src/**/*.{js,ts,jsx,tsx}",
 ],
 theme: {
 extend: {
 colors: {
 'disney-blue': '#0063B2',
 'disney-purple': '#6B2B9F',
 'gray-inactive': '#95A5A6',
 'gray-dark': '#2C3E50',
 'success': '#27AE60',
 'warning': '#F39C12',
 'error': '#E74C3C',
 },
 animation: {
 'shake': 'shake 0.3s ease-in-out',
 'flash': 'flash 0.4s ease-in-out',
 },
 keyframes: {
 shake: {
 '0%, 100%': { transform: 'translateX(0)' },
 '25%': { transform: 'translateX(-5px)' },
 '50%': { transform: 'translateX(5px)' },
 '75%': { transform: 'translateX(-5px)' },
 },
 flash: {
 '0%, 100%': { backgroundColor: 'transparent' },
 '50%': { backgroundColor: 'rgba(231, 76, 60, 0.2)' },
 }
 }
 },
 },
 plugins: [],
}
