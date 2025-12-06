import { createClient } from "@/lib/supabase/client";

/**
 * Service for likes and collections interactions
 * Matches iOS InteractionService.swift
 */
export const InteractionService = {
    // MARK: - Likes

    async like(projectId: string, userId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("likes")
            .upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id" });
    },

    async unlike(projectId: string, userId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("likes")
            .delete()
            .eq("project_id", projectId)
            .eq("user_id", userId);
    },

    async isLiked(projectId: string, userId: string): Promise<boolean> {
        const supabase = createClient();
        const { count } = await supabase
            .from("likes")
            .select("id", { count: "exact", head: true })
            .eq("project_id", projectId)
            .eq("user_id", userId);

        return (count ?? 0) > 0;
    },

    async toggleLike(projectId: string, userId: string): Promise<boolean> {
        const isLiked = await this.isLiked(projectId, userId);
        if (isLiked) {
            await this.unlike(projectId, userId);
            return false;
        } else {
            await this.like(projectId, userId);
            return true;
        }
    },

    // MARK: - Collections

    async collect(projectId: string, userId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("collections")
            .upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id" });
    },

    async uncollect(projectId: string, userId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("collections")
            .delete()
            .eq("project_id", projectId)
            .eq("user_id", userId);
    },

    async isCollected(projectId: string, userId: string): Promise<boolean> {
        const supabase = createClient();
        const { count } = await supabase
            .from("collections")
            .select("id", { count: "exact", head: true })
            .eq("project_id", projectId)
            .eq("user_id", userId);

        return (count ?? 0) > 0;
    },

    async toggleCollect(projectId: string, userId: string): Promise<boolean> {
        const isCollected = await this.isCollected(projectId, userId);
        if (isCollected) {
            await this.uncollect(projectId, userId);
            return false;
        } else {
            await this.collect(projectId, userId);
            return true;
        }
    },
};
