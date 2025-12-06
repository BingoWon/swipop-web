import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

const supabase = () => createClient();

const COMMENT_SELECT = `*, profile:profiles!comments_user_id_fkey (id, username, display_name, avatar_url)`;

/**
 * Service for comments
 * Matches iOS CommentService.swift
 */
export const CommentService = {
    async fetchComments(projectId: string, limit = 20, offset = 0): Promise<Comment[]> {
        const { data } = await supabase()
            .from("comments")
            .select(COMMENT_SELECT)
            .eq("project_id", projectId)
            .is("parent_id", null)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
        return data || [];
    },

    async fetchCommentCount(projectId: string): Promise<number> {
        const { count } = await supabase()
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("project_id", projectId);
        return count ?? 0;
    },

    async createComment(
        projectId: string,
        userId: string,
        content: string,
        parentId?: string
    ): Promise<Comment | null> {
        const { data, error } = await supabase()
            .from("comments")
            .insert({ project_id: projectId, user_id: userId, content, ...(parentId && { parent_id: parentId }) })
            .select(COMMENT_SELECT)
            .single();
        return error ? null : data;
    },

    async deleteComment(commentId: string): Promise<boolean> {
        const { error } = await supabase().from("comments").delete().eq("id", commentId);
        return !error;
    },
};
