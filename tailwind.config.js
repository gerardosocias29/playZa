import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Outfit', ...defaultTheme.fontFamily.sans],
                title: ['Outfit', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    primary: '#0b1c30',
                    secondary: '#add911',
                    accent: '#0077CC',
                    dark: '#06111e',
                    surface: '#0f243d',
                    light: '#f4f8fa',
                    limeHover: '#9cc50f',
                    navyHover: '#132c4a',
                },
            },
        },
    },

    plugins: [forms],
};
