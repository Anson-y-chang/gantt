/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        primary: "#0B95D0",
        "primary-darken-20": "#06506F",
        "primary-hover": "#197197",
        "primary-1": "#e1f3fd",
        "primary-2": "#82d6f7",
        "primary-50": "#F1FAFE",
        "primary-200": "#BDE7FA",
        "primary-800": "#0c5c80",
        "dark-200": "#bacddc",
        "grey-100": "#F2F4F7",
        "grey-500": "#667085",
        "orange-200": "#ffd2a0",
        light: "#D0D5DD",
        secondary: "#F9FAFB",
        disable: "#E1F3FD",
        highlight: "#FFF6EB",
      },
      borderColor: {
        primary: "#0B95D0",
        light: "#D0D5DD",
        button: "#1D2939",
        "grey-500": "#667085",
      },
      outlineColor: {
        primary: "#0B95D0",
      },
      textColor: {
        primary: "#1D2939",
        "primary-3": "#0b95d0",
        danger: "#FB0707",
        secondary: "#475467",
        tertiary: "#98A2B3",
        quaternary: "#D0D5DD",
        "grey-500": "#667085",
        "grey-700": "#344054",
      },
      transitionProperty: {
        outline: "outline",
        width: "width",
        height: "height",
      },
      willChange: {
        outline: "outline",
      },
      fill: {
        button: "#1D2939",
      },
    },
  },
  plugins: [],
};
