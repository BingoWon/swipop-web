"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";

/**
 * Full-page loading state with SidebarLayout
 */
export function PageLoading() {
    return (
        <SidebarLayout>
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-default-400">Loading...</div>
            </div>
        </SidebarLayout>
    );
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse text-default-400 ${className}`}>
            Loading...
        </div>
    );
}
