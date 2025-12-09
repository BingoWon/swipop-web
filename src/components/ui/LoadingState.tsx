"use client";

import { Spinner } from "@heroui/react";

/**
 * Full-page loading state (used inside pages that already have SidebarLayout)
 */
export function PageLoading() {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <Spinner size="lg" />
        </div>
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

