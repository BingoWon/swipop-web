"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { setupIcons } from "@/lib/icons";

// Register icon collections at module load time (before any component renders)
setupIcons();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
			<HeroUIProvider>
				<AuthProvider>{children}</AuthProvider>
			</HeroUIProvider>
		</NextThemesProvider>
	);
}
