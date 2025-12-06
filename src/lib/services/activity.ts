import { createClient } from "@/lib/supabase/client";

const supabase = () => createClient();

/**
 * Service for activities/notifications
 * Matches iOS ActivityService.swift
 */
export const ActivityService = {
	async fetchUnreadCount(userId: string): Promise<number> {
		const { count } = await supabase()
			.from("activities")
			.select("id", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("is_read", false);
		return count ?? 0;
	},

	async markAsRead(activityId: string) {
		await supabase()
			.from("activities")
			.update({ is_read: true })
			.eq("id", activityId);
	},

	async markAllAsRead(userId: string) {
		await supabase()
			.from("activities")
			.update({ is_read: true })
			.eq("user_id", userId)
			.eq("is_read", false);
	},
};
