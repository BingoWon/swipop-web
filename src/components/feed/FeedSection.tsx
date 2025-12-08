"use client";

import { Spinner } from "@heroui/react";
import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { InteractionService } from "@/lib/services/interaction";
import { createClient } from "@/lib/supabase/client";
import { useInteractionStore } from "@/lib/stores/interaction";
import type { Project } from "@/lib/types";
import { ResponsiveMasonryGrid } from "./MasonryGrid";

export function FeedSection() {
	const { user } = useAuth();
	const [projects, setProjects] = React.useState<Project[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const updateFromProjects = useInteractionStore((s) => s.updateFromProjects);
	const setLikedProjects = useInteractionStore((s) => s.setLikedProjects);

	React.useEffect(() => {
		async function fetchProjects() {
			try {
				const supabase = createClient();

				// Fetch projects and user's liked projects in parallel
				const [projectsResult, likedProjectIds] = await Promise.all([
					supabase
						.from("projects")
						.select(`*, creator:users(*)`)
						.eq("is_published", true)
						.order("created_at", { ascending: false })
						.limit(50),
					user ? InteractionService.fetchLikedProjectIds(user.id) : Promise.resolve([]),
				]);

				if (projectsResult.error) {
					console.error("Error fetching projects:", projectsResult.error);
					setError(projectsResult.error.message);
					return;
				}

				const fetchedProjects = projectsResult.data || [];
				setProjects(fetchedProjects);

				// Hydrate InteractionStore with like counts
				updateFromProjects(fetchedProjects);

				// Hydrate InteractionStore with user's liked state
				if (likedProjectIds.length > 0) {
					setLikedProjects(likedProjectIds);
				}
			} catch (err) {
				console.error("Error:", err);
				setError("Failed to load projects");
			} finally {
				setLoading(false);
			}
		}

		fetchProjects();
	}, [user, updateFromProjects, setLikedProjects]);

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
