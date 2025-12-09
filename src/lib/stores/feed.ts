/**
 * FeedStore - Global feed state management
 * Mirrors iOS FeedViewModel.swift architecture
 */
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { InteractionService } from "@/lib/services/interaction";
import { useInteractionStore } from "./interaction";
import type { Project } from "@/lib/types";

interface FeedStore {
    // State
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    hasInitialLoad: boolean;

    // Actions
    loadInitial: (userId?: string) => Promise<void>;
    refresh: (userId?: string) => Promise<void>;
    reset: () => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,
    hasInitialLoad: false,

    loadInitial: async (userId) => {
        // Only load once - like iOS hasInitialLoad guard
        if (get().hasInitialLoad) return;

        set({ hasInitialLoad: true });
        await get().refresh(userId);
    },

    refresh: async (userId) => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
            const supabase = createClient();

            const [projectsResult, likedProjectIds] = await Promise.all([
                supabase
                    .from("projects")
                    .select("*, creator:users(*)")
                    .eq("is_published", true)
                    .order("created_at", { ascending: false })
                    .limit(50),
                userId ? InteractionService.fetchLikedProjectIds(userId) : Promise.resolve([]),
            ]);

            if (projectsResult.error) {
                set({ error: projectsResult.error.message, isLoading: false });
                return;
            }

            const fetchedProjects = projectsResult.data || [];

            // Update interaction store with counts and liked state
            useInteractionStore.getState().updateFromProjects(fetchedProjects);
            if (likedProjectIds.length > 0) {
                useInteractionStore.getState().setLikedProjects(likedProjectIds);
            }

            set({ projects: fetchedProjects, isLoading: false });
        } catch (err) {
            console.error("Feed fetch error:", err);
            set({ error: "Failed to load projects", isLoading: false });
        }
    },

    reset: () => {
        set({
            projects: [],
            isLoading: false,
            error: null,
            hasInitialLoad: false,
        });
    },
}));
