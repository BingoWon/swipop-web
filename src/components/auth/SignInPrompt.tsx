"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface SignInPromptProps {
	/** Icon name from Solar icon set */
	icon: string;
	/** Message explaining why login is needed */
	message: string;
}

/**
 * Consistent sign-in prompt matching iOS app style
 * Used across pages requiring authentication
 */
export function SignInPrompt({ icon, message }: SignInPromptProps) {
	return (
		<div className="flex flex-col items-center justify-center h-full text-center gap-6">
			<Icon icon={icon} className="text-6xl text-default-400" />
			<p className="text-lg text-foreground">{message}</p>
			<Button
				as={Link}
				href="/login"
				color="primary"
				size="lg"
				className="min-w-[200px] h-12 font-semibold"
				radius="full"
			>
				Sign In
			</Button>
		</div>
	);
}

/**
 * Preset prompts for common pages
 */
export const signInPrompts = {
	profile: {
		icon: "solar:user-circle-bold",
		message: "Sign in to see your profile",
	},
	create: {
		icon: "solar:magic-stick-3-bold",
		message: "Sign in to create",
	},
	inbox: {
		icon: "solar:bell-bold",
		message: "Sign in to see your notifications",
	},
} as const;
