"use client";

import React from "react";
import type { Project } from "@/lib/types";

interface MasonryGridProps {
    projects: Project[];
    children: (project: Project) => React.ReactNode;
}

export function MasonryGrid({ projects, children }: MasonryGridProps) {
    // Split projects into columns for masonry effect
    const columnCount = 2;
    const columns: Project[][] = Array.from({ length: columnCount }, () => []);

    projects.forEach((project, index) => {
        columns[index % columnCount].push(project);
    });

    return (
        <div className="flex gap-4">
            {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex-1 flex flex-col gap-4">
                    {column.map((project) => (
                        <div key={project.id}>{children(project)}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}
