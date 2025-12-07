"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { LikeButton } from "@/components/ui/LikeButton";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
	project: Project;
}

/**
 * Project card matching iOS ProjectGridCell design
 * Uses centralized InteractionStore via LikeButton
 */
export function ProjectCard({ project }: ProjectCardProps) {
	const aspectRatio = Math.max(project.thumbnail_aspect_ratio || 0.75, 0.1);
	const creatorInitial =
		project.creator?.display_name?.[0] || project.creator?.username?.[0] || "U";
	const creatorName =
		project.creator?.display_name || project.creator?.username || "User";

	return (
		<div className="bg-content2 dark:bg-content1 rounded-xl overflow-hidden transition-transform hover:scale-[1.02]">
			{/* Clickable area - thumbnail and title */}
			<Link href={`/project/${project.id}`} className="block">
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

				{/* Title */}
				<div className="px-3 pt-2.5">
					<h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
						{project.title || "Untitled Project"}
					</h3>
				</div>
			</Link>

			{/* Footer - creator and like button (outside Link) */}
			<div className="px-3 pt-2 pb-2">
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

					{/* Like button - outside Link, no click propagation issues */}
					<LikeButton projectId={project.id} />
				</div>
			</div>
		</div>
	);
}
