// TypeScript types mirroring iOS models and Supabase schema

// Profile Link
export interface ProfileLink {
    title: string;
    url: string;
}

// User Profile
export interface Profile {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    links: ProfileLink[];
    created_at: string;
    updated_at: string;
}

// Project
export interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    html_content: string | null;
    css_content: string | null;
    js_content: string | null;
    thumbnail_url: string | null;
    thumbnail_aspect_ratio: number | null;
    tags: string[] | null;
    chat_messages: Record<string, unknown>[] | null;
    is_published: boolean;
    view_count: number;
    like_count: number;
    collect_count: number;
    comment_count: number;
    share_count: number;
    created_at: string;
    updated_at: string;
    // Joined data
    creator?: Profile;
}

// Comment
export interface Comment {
    id: string;
    user_id: string;
    project_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    profile?: Profile;
}

// Activity (Notification)
export type ActivityType = "like" | "comment" | "follow" | "collect";

export interface Activity {
    id: string;
    user_id: string;
    actor_id: string;
    type: ActivityType;
    project_id: string | null;
    comment_id: string | null;
    is_read: boolean;
    created_at: string;
    // Joined
    actor?: Profile;
    project?: Project;
}
