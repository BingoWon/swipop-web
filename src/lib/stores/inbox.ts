/**
 * InboxStore - Global inbox/activity state management
 * Caches activities to avoid refetching on navigation
 */
import { create } from "zustand";
import { ActivityService } from "@/lib/services/activity";
import { createClient } from "@/lib/supabase/client";
import type { Activity, Profile, Project } from "@/lib/types";

type ActivityWithRelations = Activity & {
	actor?: Profile;
	project?: Project;
};

interface InboxStore {
	// State
	activities: ActivityWithRelations[];
	isLoading: boolean;
	error: string | null;
	hasInitialLoad: boolean;

	// Computed
	unreadCount: () => number;

	// Actions
	loadInitial: (userId: string) => Promise<void>;
	refresh: (userId: string) => Promise<void>;
	markAsRead: (activityId: string) => Promise<void>;
	markAllAsRead: (userId: string) => Promise<void>;
	reset: () => void;
}

export const useInboxStore = create<InboxStore>((set, get) => ({
	activities: [],
	isLoading: false,
	error: null,
	hasInitialLoad: false,

	unreadCount: () => get().activities.filter((a) => !a.is_read).length,

	loadInitial: async (userId) => {
		if (get().hasInitialLoad) return;
		set({ hasInitialLoad: true });
		await get().refresh(userId);
	},

	refresh: async (userId) => {
		if (get().isLoading) return;

		set({ isLoading: true, error: null });

		try {
			const supabase = createClient();
			const { data, error } = await supabase
				.from("activities")
				.select(`
                    *,
                    actor:users!activities_actor_id_fkey (
                        id,
                        username,
                        display_name,
                        avatar_url
                    ),
                    project:projects!activities_project_id_fkey (
                        id,
                        title
                    )
                `)
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) {
				set({ error: error.message, isLoading: false });
				return;
			}

			set({ activities: data || [], isLoading: false });
		} catch (err) {
			console.error("Inbox fetch error:", err);
			set({ error: "Failed to load notifications", isLoading: false });
		}
	},

	markAsRead: async (activityId) => {
		await ActivityService.markAsRead(activityId);
		set((state) => ({
			activities: state.activities.map((a) =>
				a.id === activityId ? { ...a, is_read: true } : a,
			),
		}));
	},

	markAllAsRead: async (userId) => {
		await ActivityService.markAllAsRead(userId);
		set((state) => ({
			activities: state.activities.map((a) => ({ ...a, is_read: true })),
		}));
	},

	reset: () => {
		set({
			activities: [],
			isLoading: false,
			error: null,
			hasInitialLoad: false,
		});
	},
}));
