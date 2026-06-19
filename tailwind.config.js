/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Warm Editorial Luxury admin tokens — namespaced under `admin` so they
      // never collide with the storefront's existing color keys. Only applied
      // inside src/app/admin/** and src/components/admin/**.
      colors: {
        admin: {
          canvas: "#F5F1E8",
          surface: "#FFFFFF",
          "surface-muted": "#FBF7EF",
          "surface-sunken": "#F0EADD",
          ink: "#3D2F23",
          "ink-muted": "#7C6248",
          "ink-subtle": "#A8917A",
          heading: "#8B4513",
          hairline: "#E7DBC6",
          gold: "#C9A227",
          "gold-soft": "#F3E9CC",
          brown: "#8B4513",
          "brown-hover": "#743A10",
          "on-accent": "#FBF7EF",
          danger: "#B4503C",
          "danger-hover": "#9A4030",
        },
      },
      boxShadow: {
        "admin-card":
          "0 1px 2px rgba(80,50,20,0.04), 0 6px 16px -4px rgba(80,50,20,0.08)",
        "admin-card-hover":
          "0 2px 4px rgba(80,50,20,0.06), 0 12px 28px -6px rgba(80,50,20,0.12)",
        "admin-popover": "0 8px 24px -6px rgba(58,42,24,0.18)",
      },
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
