"use client";

import { Spinner } from "@heroui/react";
import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useFeedStore } from "@/lib/stores/feed";
import { MasonryGrid } from "./MasonryGrid";

/**
 * FeedSection - Uses global FeedStore for persistent data
 * Matches iOS FeedView + FeedViewModel architecture
 */
export function FeedSection() {
	const { user } = useAuth();
	const { projects, isLoading, error, loadInitial } = useFeedStore();

	// Load feed once on mount (cached on subsequent visits)
	React.useEffect(() => {
		loadInitial(user?.id);
	}, [user?.id, loadInitial]);

	if (isLoading && projects.length === 0) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error && projects.length === 0) {
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

	return <MasonryGrid projects={projects} />;
}
