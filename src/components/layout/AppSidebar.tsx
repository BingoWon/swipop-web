"use client";

import React from "react";
import { Avatar, Button, ScrollShadow, Spacer, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Sidebar from "./Sidebar";
import { sidebarItems, secondarySidebarItems } from "./sidebar-items";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ActivityService } from "@/lib/services/activity";

interface AppSidebarProps {
    isCompact?: boolean;
}

export function AppSidebar({ isCompact = false }: AppSidebarProps) {
    const pathname = usePathname();
    const { user, profile, loading, signOut } = useAuth();
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Fetch unread notification count
    React.useEffect(() => {
        if (user) {
            ActivityService.fetchUnreadCount(user.id).then(setUnreadCount);
        }
    }, [user]);

    // Determine selected key based on current path
    const getSelectedKey = () => {
        if (pathname === "/") return "home";
        if (pathname.startsWith("/create")) return "create";
        if (pathname.startsWith("/inbox")) return "inbox";
        if (pathname.startsWith("/profile")) return "profile";
        if (pathname.startsWith("/search")) return "search";
        if (pathname.startsWith("/settings")) return "settings";
        return "home";
    };

    // Update inbox badge with real count
    const itemsWithBadge = sidebarItems.map((item) => {
        if (item.key === "inbox" && unreadCount > 0) {
            return {
                ...item,
                endContent: (
                    <span className="bg-primary text-primary-foreground text-tiny px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {unreadCount}
                    </span>
                ),
            };
        }
        return item;
    });

    return (
        <div className="border-r border-divider relative flex h-full w-72 flex-col p-6 bg-content1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-2">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                    <Icon icon="solar:code-bold" className="text-lg" />
                </div>
                {!isCompact && <span className="text-lg font-bold">Swipop</span>}
            </Link>

            <Spacer y={8} />

            {/* User Info */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Spinner size="sm" />
                </div>
            ) : user && profile ? (
                <Link
                    href={`/profile/${profile.username}`}
                    className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity"
                >
                    <Avatar
                        size="sm"
                        showFallback
                        name={profile.display_name?.[0] || profile.username?.[0] || "U"}
                        src={profile.avatar_url || undefined}
                        className="flex-shrink-0"
                    />
                    {!isCompact && (
                        <div className="flex flex-col">
                            <p className="text-small text-foreground font-medium">
                                {profile.display_name || profile.username}
                            </p>
                            <p className="text-tiny text-default-400">@{profile.username}</p>
                        </div>
                    )}
                </Link>
            ) : (
                <div className="flex items-center gap-3 px-2">
                    <Avatar size="sm" showFallback name="U" className="flex-shrink-0" />
                    {!isCompact && (
                        <div className="flex flex-col">
                            <p className="text-small text-foreground font-medium">Guest</p>
                            <p className="text-tiny text-default-400">Not signed in</p>
                        </div>
                    )}
                </div>
            )}

            <Spacer y={6} />

            {/* Main Navigation */}
            <ScrollShadow className="-mr-6 h-full max-h-full pr-6">
                <Sidebar
                    defaultSelectedKey={getSelectedKey()}
                    items={itemsWithBadge}
                    isCompact={isCompact}
                />

                <Spacer y={6} />

                {/* Secondary Navigation */}
                <Sidebar
                    defaultSelectedKey=""
                    items={secondarySidebarItems}
                    isCompact={isCompact}
                />
            </ScrollShadow>

            <Spacer y={4} />

            {/* Footer Actions */}
            <div className="mt-auto flex flex-col gap-1">
                <div className="flex items-center justify-between px-2">
                    {!isCompact && <span className="text-small text-default-400">Theme</span>}
                    <ThemeToggle />
                </div>

                {user ? (
                    <Button
                        fullWidth={!isCompact}
                        className="text-default-500 data-[hover=true]:text-foreground justify-start"
                        startContent={
                            <Icon className="text-default-500" icon="solar:logout-2-bold" width={24} />
                        }
                        variant="light"
                        onPress={signOut}
                    >
                        {!isCompact && "Sign Out"}
                    </Button>
                ) : (
                    <Button
                        as={Link}
                        href="/login"
                        fullWidth={!isCompact}
                        className="text-default-500 data-[hover=true]:text-foreground justify-start"
                        startContent={
                            <Icon className="text-default-500" icon="solar:login-2-bold" width={24} />
                        }
                        variant="light"
                    >
                        {!isCompact && "Sign In"}
                    </Button>
                )}

                <Button
                    className="text-default-500 data-[hover=true]:text-foreground justify-start"
                    startContent={
                        <Icon className="text-default-500" icon="solar:info-circle-bold" width={24} />
                    }
                    variant="light"
                >
                    {!isCompact && "Help & Info"}
                </Button>
            </div>
        </div>
    );
}
