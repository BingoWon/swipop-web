"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";

/**
 * Shared layout for all main pages with sidebar.
 * This layout persists across navigation, preventing sidebar remounts.
 */
export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
