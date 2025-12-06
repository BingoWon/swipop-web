import { createClient } from "@/lib/supabase/client";

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
};
