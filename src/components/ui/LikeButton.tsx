"use client";

import { Icon } from "@iconify/react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useInteractionStore } from "@/lib/stores/interaction";
import { formatCount } from "@/lib/utils/format";

interface LikeButtonProps {
	projectId: string;
	size?: "compact" | "regular";
}

/**
 * Standalone LikeButton component matching iOS LikeButton
 * Uses InteractionStore for centralized state management
 */
export function LikeButton({ projectId, size = "compact" }: LikeButtonProps) {
	const { user } = useAuth();
	const isLiked = useInteractionStore((s) => s.isLiked(projectId));
	const likeCount = useInteractionStore((s) => s.likeCount(projectId));
	const toggleLike = useInteractionStore((s) => s.toggleLike);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (user) {
			toggleLike(projectId, user.id);
		}
	};

	const iconSize = size === "compact" ? "text-base" : "text-lg";
	const textSize = size === "compact" ? "text-sm" : "text-base";

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={!user}
			className="flex items-center gap-1.5 min-w-[52px] min-h-[28px] px-1 justify-end disabled:opacity-40 hover:opacity-80 active:scale-95 transition-all"
		>
			<Icon
				icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
				className={`${iconSize} ${isLiked ? "text-danger" : "text-default-500"}`}
			/>
			<span
				className={`${textSize} font-medium tabular-nums ${isLiked ? "text-danger" : "text-default-500"}`}
			>
				{formatCount(likeCount)}
			</span>
		</button>
	);
}
