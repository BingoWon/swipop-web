"use client";

import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/lib/types";

interface MasonryGridProps {
	projects: Project[];
	gap?: number;
}

/**
 * Responsive masonry grid using CSS columns with dynamic column count.
 * Uses a single DOM render with CSS media queries for column responsiveness.
 *
 * Breakpoints:
 * - Mobile (<640px): 2 columns
 * - sm (640px-767px): 3 columns
 * - md (768px-1023px): 4 columns
 * - lg (1024px+): 5 columns
 */
export function MasonryGrid({ projects, gap = 12 }: MasonryGridProps) {
	return (
		<div
			className="w-full masonry-grid"
			style={
				{
					"--masonry-gap": `${gap}px`,
				} as React.CSSProperties
			}
		>
			{projects.map((project) => (
				<div
					key={project.id}
					className="break-inside-avoid"
					style={{ marginBottom: `${gap}px` }}
				>
					<ProjectCard project={project} />
				</div>
			))}

			{/* Scoped styles using CSS custom properties */}
			<style jsx>{`
				.masonry-grid {
					column-gap: var(--masonry-gap);
					column-count: 2; /* Mobile default */
				}
				@media (min-width: 640px) {
					.masonry-grid {
						column-count: 3;
					}
				}
				@media (min-width: 768px) {
					.masonry-grid {
						column-count: 4;
					}
				}
				@media (min-width: 1024px) {
					.masonry-grid {
						column-count: 5;
					}
				}
			`}</style>
		</div>
	);
}

/**
 * @deprecated Use MasonryGrid instead - this alias is kept for compatibility
 */
export const ResponsiveMasonryGrid = MasonryGrid;
