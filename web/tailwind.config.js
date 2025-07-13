export default {
	content: [
	  "./styles/index.html",
	  "./src/**/*.{js,ts,jsx,tsx}"
	],
	darkMode: 'class', // Enables toggling dark mode using a class
	safelist: [
	  {
		pattern: /col-start-(\d+)/,
	  },
	  {
		pattern: /col-span-(\d+)/,
	  },
	  {
		pattern: /row-start-(\d+)/,
	  },
	  {
		pattern: /row-span-(\d+)/,
	  },
	],
	theme: {
	  container: {
		center: true,
	  },
  
	  extend: {
		screens: {
			'xl': '1300px',
		},
		colors: {
		  bg_primary: "#8a63ff",
		  bg_secondary: "#ffc3b6",
		},
		fontFamily: {
		  sans: ["Inter", "sans-serif"],
		  satisfy: ['Satisfy', 'cursive'],
		  architect: ['"Architects Daughter"', 'cursive'],
		  lobster: ['Lobster', 'sans-serif'],
		  molle: ["Molle", "cursive"],
		  fascinate: ['Fascinate', 'system-ui'],
		}
	  }
	},
	plugins: []
  }