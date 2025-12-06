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
 */
export function MasonryGrid({ projects, columns = 2, gap = 12 }: MasonryGridProps) {
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
 * Uses CSS media queries for responsive column count.
 */
export function ResponsiveMasonryGrid({ projects, gap = 12 }: Omit<MasonryGridProps, "columns">) {
    return (
        <>
            {/* Mobile: 2 columns */}
            <div
                className="block md:hidden w-full"
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

            {/* Tablet: 3 columns */}
            <div
                className="hidden md:block lg:hidden w-full"
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

            {/* Desktop: 4 columns */}
            <div
                className="hidden lg:block w-full"
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
        </>
    );
}
