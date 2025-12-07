"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { InteractionService } from "@/lib/services/interaction";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
	project: Project;
}

/**
 * Project card matching iOS ProjectGridCell design with real interactions
 */
export function ProjectCard({ project }: ProjectCardProps) {
	const { user } = useAuth();
	const [isLiked, setIsLiked] = React.useState(false);
	const [likeCount, setLikeCount] = React.useState(project.like_count);
	const [isLoading, setIsLoading] = React.useState(false);

	// Check if user has liked this project
	React.useEffect(() => {
		if (user) {
			InteractionService.isLiked(project.id, user.id).then(setIsLiked);
		}
	}, [user, project.id]);

	const aspectRatio = Math.max(project.thumbnail_aspect_ratio || 0.75, 0.1);

	const handleLike = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user || isLoading) return;

		setIsLoading(true);
		// Optimistic update
		const wasLiked = isLiked;
		setIsLiked(!isLiked);
		setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

		try {
			const newIsLiked = await InteractionService.toggleLike(
				project.id,
				user.id,
			);
			setIsLiked(newIsLiked);
			setLikeCount(newIsLiked ? project.like_count + 1 : project.like_count);
		} catch (error) {
			// Revert on error
			setIsLiked(wasLiked);
			setLikeCount(wasLiked ? project.like_count + 1 : project.like_count);
			console.error("Error toggling like:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const creatorInitial =
		project.creator?.display_name?.[0] || project.creator?.username?.[0] || "U";

	const creatorName =
		project.creator?.display_name || project.creator?.username || "User";

	return (
		<Link href={`/project/${project.id}`} className="block">
			<div className="bg-content2 dark:bg-content1 rounded-xl overflow-hidden transition-transform hover:scale-[1.02]">
				{/* Thumbnail */}
				<div
					className="w-full bg-default-100 relative"
					style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
				>
					{project.thumbnail_url ? (
						<img
							src={project.thumbnail_url}
							alt={project.title || "Project thumbnail"}
							className="absolute inset-0 w-full h-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
							<Icon
								icon="solar:code-bold"
								className="text-3xl text-default-400"
							/>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="px-3 pt-2.5 pb-2">
					<h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">
						{project.title || "Untitled Project"}
					</h3>

					<div className="flex items-center gap-2">
						{/* Creator avatar */}
						<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
							<span className="text-[10px] font-bold text-white">
								{creatorInitial}
							</span>
						</div>

						{/* Creator name */}
						<span className="text-sm text-default-500 truncate flex-1">
							{creatorName}
						</span>

						{/* Like button - relative z-10 ensures clickable above Link */}
						<button
							type="button"
							onClick={handleLike}
							disabled={!user || isLoading}
							className="relative z-10 flex items-center gap-1.5 min-w-[52px] h-8 justify-end disabled:opacity-50 hover:opacity-80 transition-opacity"
						>
							<Icon
								icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
								className={`text-base ${isLiked ? "text-danger" : "text-default-400"}`}
							/>
							<span
								className={`text-sm font-medium ${isLiked ? "text-danger" : "text-default-400"}`}
							>
								{formatCount(likeCount)}
							</span>
						</button>
					</div>
				</div>
			</div>
		</Link>
	);
}

function formatCount(count: number): string {
	if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
	if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
	return count.toString();
}
