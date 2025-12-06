import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

/**
 * Service for comments
 * Matches iOS CommentService.swift
 */
export const CommentService = {
    // MARK: - Fetch

    async fetchComments(
        projectId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<Comment[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("comments")
            .select(`
        *,
        profile:profiles!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
            .eq("project_id", projectId)
            .is("parent_id", null)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching comments:", error);
            return [];
        }

        return data || [];
    },

    async fetchCommentCount(projectId: string): Promise<number> {
        const supabase = createClient();
        const { count } = await supabase
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("project_id", projectId);

        return count ?? 0;
    },

    // MARK: - Create

    async createComment(
        projectId: string,
        userId: string,
        content: string,
        parentId?: string
    ): Promise<Comment | null> {
        const supabase = createClient();

        const insertData: Record<string, string> = {
            project_id: projectId,
            user_id: userId,
            content: content,
        };

        if (parentId) {
            insertData.parent_id = parentId;
        }

        const { data, error } = await supabase
            .from("comments")
            .insert(insertData)
            .select(`
        *,
        profile:profiles!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
            .single();

        if (error) {
            console.error("Error creating comment:", error);
            return null;
        }

        return data;
    },

    // MARK: - Delete

    async deleteComment(commentId: string): Promise<boolean> {
        const supabase = createClient();
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            console.error("Error deleting comment:", error);
            return false;
        }

        return true;
    },
};
