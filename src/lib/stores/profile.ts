/**
 * ProfileStore - Global profile state management
 * Mirrors iOS ProfileViewModel.swift architecture
 * Caches profiles by username to avoid refetching on navigation
 */
import { create } from "zustand";
import { InteractionService } from "@/lib/services/interaction";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Project } from "@/lib/types";

interface ProfileData {
	profile: Profile;
	projects: Project[];
	likedProjects: Project[];
	collectedProjects: Project[];
	isFollowing: boolean;
	followerCount: number;
	followingCount: number;
	likeCount: number;
	loadedAt: number;
}

interface ProfileStore {
	// Cached profiles by username
	profiles: Record<string, ProfileData>;
	loadingUsername: string | null;
	error: string | null;

	// Actions
	loadProfile: (username: string, currentUserId?: string) => Promise<void>;
	updateProfile: (username: string, updates: Partial<Profile>) => void;
	toggleFollow: (username: string, currentUserId: string) => Promise<void>;
	invalidateProfile: (username: string) => void;
	reset: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = create<ProfileStore>((set, get) => ({
	profiles: {},
	loadingUsername: null,
	error: null,

	loadProfile: async (username, currentUserId) => {
		const cached = get().profiles[username];

		// Return cached if fresh enough
		if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
			return;
		}

		// Don't reload if already loading this profile
		if (get().loadingUsername === username) return;

		set({ loadingUsername: username, error: null });

		try {
			const supabase = createClient();

			// Fetch profile
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("username", username)
				.single();

			if (profileError || !profile) {
				set({ error: "User not found", loadingUsername: null });
				return;
			}

			// Fetch all related data in parallel
			const [
				projectsResult,
				likedResult,
				collectedResult,
				followerCount,
				followingCount,
				isFollowing,
			] = await Promise.all([
				supabase
					.from("projects")
					.select("*, creator:users(*)")
					.eq("user_id", profile.id)
					.order("created_at", { ascending: false }),
				InteractionService.fetchLikedProjects(profile.id),
				InteractionService.fetchCollectedProjects(profile.id),
				UserService.fetchFollowerCount(profile.id),
				UserService.fetchFollowingCount(profile.id),
				currentUserId
					? UserService.isFollowing(currentUserId, profile.id)
					: Promise.resolve(false),
			]);

			// Calculate total likes on user's projects
			const projects = projectsResult.data || [];
			const likeCount = projects.reduce(
				(sum: number, p: { like_count?: number | null }) =>
					sum + (p.like_count || 0),
				0,
			);

			set((state) => ({
				profiles: {
					...state.profiles,
					[username]: {
						profile,
						projects,
						likedProjects: likedResult,
						collectedProjects: collectedResult,
						isFollowing,
						followerCount,
						followingCount,
						likeCount,
						loadedAt: Date.now(),
					},
				},
				loadingUsername: null,
			}));
		} catch (err) {
			console.error("Profile fetch error:", err);
			set({ error: "Failed to load profile", loadingUsername: null });
		}
	},

	updateProfile: (username, updates) => {
		set((state) => {
			const existing = state.profiles[username];
			if (!existing) return state;

			return {
				profiles: {
					...state.profiles,
					[username]: {
						...existing,
						profile: { ...existing.profile, ...updates },
					},
				},
			};
		});
	},

	toggleFollow: async (username, currentUserId) => {
		const cached = get().profiles[username];
		if (!cached) return;

		const wasFollowing = cached.isFollowing;

		// Optimistic update
		set((state) => ({
			profiles: {
				...state.profiles,
				[username]: {
					...cached,
					isFollowing: !wasFollowing,
					followerCount: cached.followerCount + (wasFollowing ? -1 : 1),
				},
			},
		}));

		try {
			await UserService.toggleFollow(currentUserId, cached.profile.id);
		} catch (err) {
			// Rollback on error
			set((state) => ({
				profiles: {
					...state.profiles,
					[username]: {
						...cached,
						isFollowing: wasFollowing,
						followerCount: cached.followerCount,
					},
				},
			}));
			console.error("Failed to toggle follow:", err);
		}
	},

	invalidateProfile: (username) => {
		set((state) => {
			const { [username]: _, ...rest } = state.profiles;
			return { profiles: rest };
		});
	},

	reset: () => {
		set({ profiles: {}, loadingUsername: null, error: null });
	},
}));
