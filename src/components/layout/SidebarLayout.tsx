"use client";

import type React from "react";
import { AppSidebar } from "./AppSidebar";

interface SidebarLayoutProps {
	children: React.ReactNode;
	/** Disable default padding for full-bleed pages */
	noPadding?: boolean;
}

/**
 * Main layout component with sidebar
 * Provides consistent p-4/md:p-6 padding unless noPadding is set
 */
export function SidebarLayout({
	children,
	noPadding = false,
}: SidebarLayoutProps) {
	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar - hidden on mobile, shown on md+ */}
			<aside className="hidden md:flex h-full flex-shrink-0">
				<AppSidebar />
			</aside>

			{/* Main Content - padding applied directly to main element */}
			<main
				className={`flex-1 overflow-auto ${noPadding ? "" : "p-4 md:p-6"}`}
			>
				{children}
			</main>
		</div>
	);
}
