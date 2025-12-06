"use client";

import type React from "react";
import { AppSidebar } from "./AppSidebar";

interface SidebarLayoutProps {
	children: React.ReactNode;
	/** Disable default padding (for full-bleed pages like project viewer) */
	noPadding?: boolean;
}

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

			{/* Main Content with unified padding */}
			<main className="flex-1 overflow-auto">
				<div className={noPadding ? "" : "p-4 md:p-6"}>{children}</div>
			</main>
		</div>
	);
}
