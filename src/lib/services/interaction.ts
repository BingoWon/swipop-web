import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

const supabase = () => createClient();

/**
 * Service for likes and collections
 * Matches iOS InteractionService.swift
 */
export const InteractionService = {
	async like(projectId: string, userId: string) {
		await supabase()
			.from("likes")
			.upsert(
				{ project_id: projectId, user_id: userId },
				{ onConflict: "project_id,user_id" },
			);
	},

	async unlike(projectId: string, userId: string) {
		await supabase()
			.from("likes")
			.delete()
			.eq("project_id", projectId)
			.eq("user_id", userId);
	},

	async isLiked(projectId: string, userId: string): Promise<boolean> {
		const { count } = await supabase()
			.from("likes")
			.select("id", { count: "exact", head: true })
			.eq("project_id", projectId)
			.eq("user_id", userId);
		return (count ?? 0) > 0;
	},

	async toggleLike(projectId: string, userId: string): Promise<boolean> {
		const liked = await this.isLiked(projectId, userId);
		liked
			? await this.unlike(projectId, userId)
			: await this.like(projectId, userId);
		return !liked;
	},

	async collect(projectId: string, userId: string) {
		await supabase()
			.from("collections")
			.upsert(
				{ project_id: projectId, user_id: userId },
				{ onConflict: "project_id,user_id" },
			);
	},

	async uncollect(projectId: string, userId: string) {
		await supabase()
			.from("collections")
			.delete()
			.eq("project_id", projectId)
			.eq("user_id", userId);
	},

	async isCollected(projectId: string, userId: string): Promise<boolean> {
		const { count } = await supabase()
			.from("collections")
			.select("id", { count: "exact", head: true })
			.eq("project_id", projectId)
			.eq("user_id", userId);
		return (count ?? 0) > 0;
	},

	async toggleCollect(projectId: string, userId: string): Promise<boolean> {
		const collected = await this.isCollected(projectId, userId);
		collected
			? await this.uncollect(projectId, userId)
			: await this.collect(projectId, userId);
		return !collected;
	},

	// Fetch total likes received by a user's projects
	async fetchLikeCount(userId: string): Promise<number> {
		const { data } = await supabase()
			.from("projects")
			.select("like_count")
			.eq("user_id", userId)
			.eq("is_published", true);
		return (
			data?.reduce(
				(sum: number, p: { like_count: number | null }) =>
					sum + (p.like_count || 0),
				0,
			) ?? 0
		);
	},

	// Fetch project IDs liked by a user (lightweight, for hydrating like state)
	async fetchLikedProjectIds(userId: string): Promise<string[]> {
		const { data } = await supabase()
			.from("likes")
			.select("project_id")
			.eq("user_id", userId);
		return data?.map((d: { project_id: string }) => d.project_id) ?? [];
	},

	// Fetch projects liked by a user
	async fetchLikedProjects(userId: string): Promise<Project[]> {
		const { data } = await supabase()
			.from("likes")
			.select("project:projects(*)")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });
		if (!data) return [];
		return data
			.map((d: { project: unknown }) => d.project)
			.filter(Boolean) as unknown as Project[];
	},

	// Fetch projects collected by a user
	async fetchCollectedProjects(userId: string): Promise<Project[]> {
		const { data } = await supabase()
			.from("collections")
			.select("project:projects(*)")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });
		if (!data) return [];
		return data
			.map((d: { project: unknown }) => d.project)
			.filter(Boolean) as unknown as Project[];
	},
};
