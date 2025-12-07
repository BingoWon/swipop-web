import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InteractionService } from "@/lib/services/interaction";

interface InteractionState {
    isLiked: boolean;
    likeCount: number;
}

interface InteractionStore {
    states: Record<string, InteractionState>;

    // Read state
    isLiked: (projectId: string) => boolean;
    likeCount: (projectId: string) => number;

    // Update from server data
    updateFromProjects: (
        projects: Array<{ id: string; like_count: number }>,
    ) => void;

    // Toggle like with optimistic update
    toggleLike: (projectId: string, userId: string) => Promise<void>;

    // Reset on logout
    reset: () => void;
}

export const useInteractionStore = create<InteractionStore>()(
    persist(
        (set, get) => ({
            states: {},

            isLiked: (projectId) => get().states[projectId]?.isLiked ?? false,

            likeCount: (projectId) => get().states[projectId]?.likeCount ?? 0,

            updateFromProjects: (projects) => {
                set((state) => {
                    const newStates = { ...state.states };
                    for (const project of projects) {
                        newStates[project.id] = {
                            isLiked: newStates[project.id]?.isLiked ?? false,
                            likeCount: project.like_count,
                        };
                    }
                    return { states: newStates };
                });
            },

            toggleLike: async (projectId, userId) => {
                const current = get().states[projectId];
                const wasLiked = current?.isLiked ?? false;
                const oldCount = current?.likeCount ?? 0;

                // Optimistic update
                set((state) => ({
                    states: {
                        ...state.states,
                        [projectId]: {
                            isLiked: !wasLiked,
                            likeCount: wasLiked ? oldCount - 1 : oldCount + 1,
                        },
                    },
                }));

                try {
                    await InteractionService.toggleLike(projectId, userId);
                } catch (error) {
                    // Rollback on error
                    set((state) => ({
                        states: {
                            ...state.states,
                            [projectId]: {
                                isLiked: wasLiked,
                                likeCount: oldCount,
                            },
                        },
                    }));
                    console.error("Failed to toggle like:", error);
                }
            },

            reset: () => set({ states: {} }),
        }),
        {
            name: "swipop-interactions",
            partialize: (state) => ({
                states: Object.fromEntries(
                    Object.entries(state.states).filter(([, v]) => v.isLiked),
                ),
            }),
        },
    ),
);
