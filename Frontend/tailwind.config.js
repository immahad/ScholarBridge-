module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        Mulish: ["Mulish", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      backgroundImage: {
        heroPattern: "url('./src/homeimage/vecteezy_girl-and-boy-with-books_10429681.png')",
      },
      animation: {
        fadeInLeft: "fadeInLeft 1s ease-in-out", // Add the fadeInLeft animation
        fadeInRight: "fadeInRight 1s ease-in-out",
      },
      keyframes: {
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-200px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(200px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
