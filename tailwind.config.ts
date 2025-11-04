import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sageBg:   "#F5F7F6",
        sageHdr:  "#CAD8D0",
        sageBrd1: "#D2DED8",
        sageBrd2: "#C8D6CF",
        sageSoft1:"#E0E8E3",
        sageSoft2:"#E7EFEA",
        navy:     "#0F1A2B"
      }
    }
  },
  plugins: []
};
export default config;
