"use client";

import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/lib/types";

interface MasonryGridProps {
	projects: Project[];
	gap?: number;
	minColumnWidth?: number;
}

/**
 * Responsive masonry grid with adaptive column count.
 * Columns are automatically calculated based on container width.
 * Each column is at least minColumnWidth (default 250px) and fills remaining space.
 */
export function MasonryGrid({ projects, gap = 8, minColumnWidth = 250 }: MasonryGridProps) {
	return (
		<div
			className="w-full"
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
				gap: `${gap}px`,
			}}
		>
			{projects.map((project) => (
				<ProjectCard key={project.id} project={project} />
			))}
		</div>
	);
}

/**
 * @deprecated Use MasonryGrid instead - this alias is kept for compatibility
 */
export const ResponsiveMasonryGrid = MasonryGrid;
