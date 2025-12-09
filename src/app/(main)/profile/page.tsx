"use client";

import { redirect } from "next/navigation";
import { SignInPrompt, signInPrompts } from "@/components/auth/SignInPrompt";
import { PageLoading } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Profile page - shows SignInPrompt for unauthenticated users,
 * redirects to user's profile page when authenticated
 */
export default function ProfilePage() {
    const { user, profile, loading } = useAuth();

    if (loading || (user && !profile)) {
        return <div className="p-4 md:p-6"><PageLoading /></div>;
    }

    if (!user) {
        return <div className="p-4 md:p-6 h-[60vh]"><SignInPrompt {...signInPrompts.profile} /></div>;
    }

    redirect(`/profile/${profile!.username}`);
}
