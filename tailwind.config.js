/** @type {import('tailwindcss').Config} */
const { light, dark } = require('daisyui/src/theming/themes');

module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			animation: {
				'fade-in': 'fadeIn 300ms ease-out forwards',
				'slide-in-right': 'slideInRight 500ms ease-out forwards',
				'slide-out-right': 'slideOutRight 500ms ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideInRight: {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				slideOutRight: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' },
				},
			},
		},
	},
	plugins: [require('daisyui')],

	daisyui: {
		themes: [
			{
				light: {
					...light,
					'base-100': '#f5f5f5',
					'base-200': '#b8b8b8',
					'base-300': '#8f8f8f',
				},
				dark: {
					...dark,
					'base-100': '#262d38',
					'base-200': '#12161c',
					'base-300': '#080a0e',
				},
			},
		],
		darkTheme: 'dark', // name of one of the included themes for dark mode
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors) If you're using a second CSS library that has similar class names, you can use this config to avoid conflicts. Utility classes like color names (e.g. bg-primary) or border-radius (e.g. rounded-box) will not be affected by this config because they're being added as extensions to Tailwind CSS classes. If you use daisyUI prefix option (like daisy-) and Tailwind CSS prefix option (like tw-) together, classnames will be prefixed like this: tw-daisy-btn.
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ':root', // The element that receives theme color CSS variables. It may be useful to set this to e.g. *, so all components will have access to the required CSS variables.
	},
};
