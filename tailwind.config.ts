import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Zen Kaku Gothic New", "Hiragino Sans", "sans-serif"],
        display: ["Outfit", "Zen Kaku Gothic New", "sans-serif"],
      },
      colors: {
        brand: {
          green: "#3eb991",
          teal: "#2fb5a3",
          cyan: "#22b1b1",
          blue: "#21aacc",
          deep: "#0f2350",
        },
        primary: {
          DEFAULT: "#0f2350",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "#3eb991",
          foreground: "hsl(var(--accent-foreground))",
        },
        support: {
          gray: "#6B7280",
          beige: "#F3F4F6",
          blue: {
            light: "#e0f7ff",
            dark: "#0f2350",
          },
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #3eb991 0%, #2fb5a3 25%, #22b1b1 50%, #21aacc 100%)",
        "gradient-brand-reverse":
          "linear-gradient(135deg, #21aacc 0%, #22b1b1 50%, #3eb991 100%)",
        "gradient-radial":
          "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        gradient: "gradient-rotate 4s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(62, 185, 145, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(33, 170, 204, 0.4)" },
        },
        "gradient-rotate": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;
