"use client";

import React from "react";
import { ResponsiveMasonryGrid } from "./MasonryGrid";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@heroui/react";
import type { Project } from "@/lib/types";

export function FeedSection() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchProjects() {
            try {
                const supabase = createClient();

                // Use users(*) to match iOS app's selectWithCreator
                const { data, error } = await supabase
                    .from("projects")
                    .select(`*, creator:users(*)`)
                    .eq("is_published", true)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) {
                    console.error("Error fetching projects:", error);
                    setError(error.message);
                    return;
                }

                setProjects(data || []);
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load projects");
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-default-500">
                <p>{error}</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-20 text-default-500">
                <p>No projects yet. Be the first to create one!</p>
            </div>
        );
    }

    return <ResponsiveMasonryGrid projects={projects} />;
}
