"use client";

import type React from "react";
import { AppSidebar } from "./AppSidebar";

/**
 * Main layout component with sidebar.
 * Pages are responsible for their own padding via PageContainer.
 */
export function SidebarLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen bg-background">
			<aside className="hidden md:flex h-full flex-shrink-0">
				<AppSidebar />
			</aside>
			<main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
		</div>
	);
}
