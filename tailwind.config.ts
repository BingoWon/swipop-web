import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	darkMode: "class",
	plugins: [
		heroui({
			themes: {
				light: {
					colors: {
						primary: {
							50: "#faf5ff",
							100: "#f3e8ff",
							200: "#e9d5ff",
							300: "#d8b4fe",
							400: "#c084fc",
							500: "#a855f7", // iOS brand color
							600: "#9333ea",
							700: "#7e22ce",
							800: "#6b21a8",
							900: "#581c87",
							DEFAULT: "#a855f7",
							foreground: "#ffffff",
						},
						secondary: {
							50: "#eef2ff",
							100: "#e0e7ff",
							200: "#c7d2fe",
							300: "#a5b4fc",
							400: "#818cf8",
							500: "#6366f1", // iOS brandSecondary
							600: "#4f46e5",
							700: "#4338ca",
							800: "#3730a3",
							900: "#312e81",
							DEFAULT: "#6366f1",
							foreground: "#ffffff",
						},
					},
				},
				dark: {
					colors: {
						primary: {
							50: "#faf5ff",
							100: "#f3e8ff",
							200: "#e9d5ff",
							300: "#d8b4fe",
							400: "#c084fc",
							500: "#a855f7",
							600: "#9333ea",
							700: "#7e22ce",
							800: "#6b21a8",
							900: "#581c87",
							DEFAULT: "#a855f7",
							foreground: "#ffffff",
						},
						secondary: {
							50: "#eef2ff",
							100: "#e0e7ff",
							200: "#c7d2fe",
							300: "#a5b4fc",
							400: "#818cf8",
							500: "#6366f1",
							600: "#4f46e5",
							700: "#4338ca",
							800: "#3730a3",
							900: "#312e81",
							DEFAULT: "#6366f1",
							foreground: "#ffffff",
						},
					},
				},
			},
		}),
	],
};

export default config;
