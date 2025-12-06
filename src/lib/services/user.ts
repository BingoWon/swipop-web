import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

/**
 * Service for user profiles and follows
 * Matches iOS UserService.swift
 */
export const UserService = {
    // MARK: - Follow

    async follow(followerId: string, followingId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("follows")
            .upsert(
                { follower_id: followerId, following_id: followingId },
                { onConflict: "follower_id,following_id" }
            );
    },

    async unfollow(followerId: string, followingId: string): Promise<void> {
        const supabase = createClient();
        await supabase
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);
    },

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const supabase = createClient();
        const { count } = await supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", followerId)
            .eq("following_id", followingId);

        return (count ?? 0) > 0;
    },

    async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
        const isFollowing = await this.isFollowing(followerId, followingId);
        if (isFollowing) {
            await this.unfollow(followerId, followingId);
            return false;
        } else {
            await this.follow(followerId, followingId);
            return true;
        }
    },

    // MARK: - Stats

    async fetchFollowerCount(userId: string): Promise<number> {
        const supabase = createClient();
        const { count } = await supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", userId);

        return count ?? 0;
    },

    async fetchFollowingCount(userId: string): Promise<number> {
        const supabase = createClient();
        const { count } = await supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", userId);

        return count ?? 0;
    },

    // MARK: - Profile Update

    async updateProfile(
        userId: string,
        updates: Partial<Pick<Profile, "username" | "display_name" | "bio" | "links">>
    ): Promise<Profile | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating profile:", error);
            return null;
        }

        return data;
    },
};
