"use client";

import dynamic from "next/dynamic";

// Disable SSR for SidebarLayout to avoid React Aria hydration mismatch
// React Aria generates unique IDs that differ between server and client
const SidebarLayout = dynamic(
	() =>
		import("@/components/layout/SidebarLayout").then((m) => m.SidebarLayout),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-screen bg-background">
				{/* Sidebar skeleton */}
				<aside className="hidden md:flex h-full flex-shrink-0 w-72 border-r border-divider bg-content1 p-6">
					<div className="flex flex-col gap-6 w-full">
						<div className="w-24 h-8 rounded bg-default-200 animate-pulse" />
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
							<div className="flex flex-col gap-1.5">
								<div className="w-24 h-4 rounded bg-default-200 animate-pulse" />
								<div className="w-16 h-3 rounded bg-default-100 animate-pulse" />
							</div>
						</div>
						<div className="flex flex-col gap-2 mt-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="w-full h-11 rounded-large bg-default-100 animate-pulse" />
							))}
						</div>
					</div>
				</aside>
				{/* Main content area */}
				<main className="flex-1 overflow-auto p-4 md:p-6" />
			</div>
		),
	},
);

/**
 * Shared layout for all main pages with sidebar.
 * Uses dynamic import with ssr:false to prevent React Aria hydration mismatch.
 */
export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SidebarLayout>{children}</SidebarLayout>;
}
