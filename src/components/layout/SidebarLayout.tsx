"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - hidden on mobile, shown on md+ */}
            <aside className="hidden md:flex h-full flex-shrink-0">
                <AppSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
