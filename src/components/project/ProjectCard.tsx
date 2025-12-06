"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
    project: Project;
    columnWidth?: number;
}

/**
 * Project card matching iOS ProjectGridCell design:
 * - Dynamic height based on thumbnail aspect ratio
 * - 14px medium weight title, 2 lines max
 * - Creator row: 18px avatar circle, 13px name, like button with count
 * - 12px corners, secondary background, consistent padding
 */
export function ProjectCard({ project, columnWidth }: ProjectCardProps) {
    const [isLiked, setIsLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(project.like_count);

    // Calculate image height based on aspect ratio (matching iOS logic)
    const aspectRatio = Math.max(project.thumbnail_aspect_ratio || 0.75, 0.1);
    const imageHeight = columnWidth ? Math.max(columnWidth / aspectRatio, 1) : undefined;

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    // Get creator initial for avatar
    const creatorInitial =
        project.creator?.display_name?.[0] ||
        project.creator?.username?.[0] ||
        "U";

    const creatorName =
        project.creator?.display_name ||
        project.creator?.username ||
        "User";

    return (
        <Link href={`/project/${project.id}`} className="block">
            <div className="bg-content2 dark:bg-content1 rounded-xl overflow-hidden transition-transform hover:scale-[1.02]">
                {/* Thumbnail - dynamic height based on aspect ratio */}
                <div
                    className="w-full bg-default-100 relative"
                    style={{
                        paddingBottom: `${(1 / aspectRatio) * 100}%`,
                    }}
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

                {/* Content - matching iOS padding: horizontal 10, top 8, bottom 5 */}
                <div className="px-2.5 pt-2 pb-1.5">
                    {/* Title - 14px medium, 2 lines max */}
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1.5">
                        {project.title || "Untitled Project"}
                    </h3>

                    {/* Creator row - avatar + name + like button */}
                    <div className="flex items-center gap-1.5">
                        {/* Avatar - 18px circle with initial */}
                        <div className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-white">
                                {creatorInitial}
                            </span>
                        </div>

                        {/* Creator name - 13px, secondary color */}
                        <span className="text-[13px] text-default-500 truncate flex-1">
                            {creatorName}
                        </span>

                        {/* Like button - heart icon + count */}
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-0.5 min-w-[44px] h-7 justify-end"
                        >
                            <Icon
                                icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                                className={`text-[13px] ${isLiked ? "text-danger" : "text-default-400"
                                    }`}
                            />
                            <span
                                className={`text-[13px] ${isLiked ? "text-danger" : "text-default-400"
                                    }`}
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

/**
 * Format count for display (e.g., 1234 -> "1.2K")
 */
function formatCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}
