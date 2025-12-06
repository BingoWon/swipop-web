"use client";

import React from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/lib/types";

interface MasonryGridProps {
    projects: Project[];
    columns?: number;
    gap?: number;
}

/**
 * True masonry/waterfall grid layout for variable height project cards.
 * Uses CSS columns for proper masonry effect.
 * Default: 5 columns for desktop.
 */
export function MasonryGrid({ projects, columns = 5, gap = 12 }: MasonryGridProps) {
    return (
        <div
            className="w-full"
            style={{
                columnCount: columns,
                columnGap: `${gap}px`,
            }}
        >
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="break-inside-avoid"
                    style={{
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
 * Responsive masonry grid that adjusts columns based on screen size.
 * Default 5 columns on desktop, fewer on smaller screens.
 */
export function ResponsiveMasonryGrid({ projects, gap = 12 }: Omit<MasonryGridProps, "columns">) {
    return (
        <>
            {/* Mobile: 2 columns */}
            <div
                className="block sm:hidden w-full"
                style={{
                    columnCount: 2,
                    columnGap: `${gap}px`,
                }}
            >
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="break-inside-avoid"
                        style={{
                            marginBottom: `${gap}px`,
                        }}
                    >
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>

            {/* Small tablet: 3 columns */}
            <div
                className="hidden sm:block md:hidden w-full"
                style={{
                    columnCount: 3,
                    columnGap: `${gap}px`,
                }}
            >
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="break-inside-avoid"
                        style={{
                            marginBottom: `${gap}px`,
                        }}
                    >
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>

            {/* Tablet: 4 columns */}
            <div
                className="hidden md:block lg:hidden w-full"
                style={{
                    columnCount: 4,
                    columnGap: `${gap}px`,
                }}
            >
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="break-inside-avoid"
                        style={{
                            marginBottom: `${gap}px`,
                        }}
                    >
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>

            {/* Desktop: 5 columns (default) */}
            <div
                className="hidden lg:block w-full"
                style={{
                    columnCount: 5,
                    columnGap: `${gap}px`,
                }}
            >
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="break-inside-avoid"
                        style={{
                            marginBottom: `${gap}px`,
                        }}
                    >
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </>
    );
}
