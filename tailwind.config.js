/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      textShadow: {
        light: "1px 0px rgba(0,0,0,.5)",
        mid: "1px 1px 1px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,1)",
        strong:
          "1px 1px 1px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,1), 1px -1px 1px rgba(0,0,0,1), -1px 1px 1px rgba(0,0,0,1)",
      },
      text: {
        background: "#FAF9F6",
        beige: "#E5D3B3",
        peach: "#FFCDB2",
        gold: "#D4AF37",
        brown: "#8B4513",
        primary: "#8B4513",
        secondary: "#B87E5C",
        light: "#FAF9F6",
        dark: "#6B4423",
        light: "#F5E6D3",
        border: "#E5D3B3",
        buttonHover: "#D4AF37",
        shadow: "rgba(139, 69, 19, 0.1)",
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    },
  ],
};
