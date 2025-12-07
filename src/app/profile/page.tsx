"use client";

import { redirect } from "next/navigation";
import { SignInPrompt, signInPrompts } from "@/components/auth/SignInPrompt";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Profile page - shows SignInPrompt for unauthenticated users,
 * redirects to user's profile page when authenticated
 */
export default function ProfilePage() {
    const { user, profile, loading } = useAuth();

    // Show loading state while auth or profile is loading
    if (loading || (user && !profile)) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-default-400">Loading...</div>
                </div>
            </SidebarLayout>
        );
    }

    // Show sign-in prompt for unauthenticated users
    if (!user) {
        return (
            <SidebarLayout>
                <SignInPrompt {...signInPrompts.profile} />
            </SidebarLayout>
        );
    }

    // Redirect to user's profile page (profile is guaranteed to exist here)
    redirect(`/profile/${profile!.username}`);
}

