"use client";

import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/lib/types";

interface MasonryGridProps {
	projects: Project[];
	gap?: number;
	minColumnWidth?: number;
}

/**
 * True masonry grid using CSS multi-column layout.
 * Items with varying heights fill columns like bricks.
 * Column width is adaptive based on minColumnWidth (default 250px).
 */
export function MasonryGrid({
	projects,
	gap = 8,
	minColumnWidth = 250,
}: MasonryGridProps) {
	return (
		<div
			className="w-full"
			style={{
				columnWidth: `${minColumnWidth}px`,
				columnGap: `${gap}px`,
			}}
		>
			{projects.map((project) => (
				<div
					key={project.id}
					style={{
						breakInside: "avoid",
						marginBottom: `${gap}px`,
					}}
				>
					<ProjectCard project={project} />
				</div>
			))}
		</div>
	);
}

/**
 * @deprecated Use MasonryGrid instead - this alias is kept for compatibility
 */
export const ResponsiveMasonryGrid = MasonryGrid;
