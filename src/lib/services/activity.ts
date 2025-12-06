import { createClient } from "@/lib/supabase/client";

/**
 * Service for activities/notifications
 * Matches iOS ActivityService.swift
 */
export const ActivityService = {
    // MARK: - Fetch

    async fetchUnreadCount(userId: string): Promise<number> {
        const supabase = createClient();
        const { count } = await supabase
            .from("activities")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        return count ?? 0;
    },

    // MARK: - Mark as Read

    async markAsRead(activityId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("activities")
            .update({ is_read: true })
            .eq("id", activityId);
    },

    async markAllAsRead(userId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("activities")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false);
    },
};
