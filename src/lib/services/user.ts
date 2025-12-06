import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const supabase = () => createClient();

/**
 * Service for user profiles and follows
 * Matches iOS UserService.swift
 */
export const UserService = {
    async follow(followerId: string, followingId: string) {
        await supabase()
            .from("follows")
            .upsert({ follower_id: followerId, following_id: followingId }, { onConflict: "follower_id,following_id" });
    },

    async unfollow(followerId: string, followingId: string) {
        await supabase()
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);
    },

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const { count } = await supabase()
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", followerId)
            .eq("following_id", followingId);
        return (count ?? 0) > 0;
    },

    async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
        const following = await this.isFollowing(followerId, followingId);
        following ? await this.unfollow(followerId, followingId) : await this.follow(followerId, followingId);
        return !following;
    },

    async fetchFollowerCount(userId: string): Promise<number> {
        const { count } = await supabase()
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", userId);
        return count ?? 0;
    },

    async fetchFollowingCount(userId: string): Promise<number> {
        const { count } = await supabase()
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", userId);
        return count ?? 0;
    },

    async updateProfile(
        userId: string,
        updates: Partial<Pick<Profile, "username" | "display_name" | "bio" | "links">>
    ): Promise<Profile | null> {
        const { data, error } = await supabase()
            .from("profiles")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();
        return error ? null : data;
    },
};
