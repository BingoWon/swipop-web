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
		return <PageLoading />;
	}

	if (!user) {
		return <SignInPrompt {...signInPrompts.profile} />;
	}

	redirect(`/profile/${profile!.username}`);
}
