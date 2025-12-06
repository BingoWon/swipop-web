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

// Project (Frontend Creation)
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
    is_liked?: boolean;
    is_collected?: boolean;
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
    user?: Profile;
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

// Feed Project (RPC response with flattened creator)
export interface FeedProject extends Project {
    is_liked: boolean;
    is_collected: boolean;
    creator_id: string | null;
    creator_username: string | null;
    creator_display_name: string | null;
    creator_avatar_url: string | null;
    creator_bio: string | null;
}

// Helper to convert FeedProject to Project
export function feedProjectToProject(feed: FeedProject): Project {
    const creator: Profile | undefined = feed.creator_id
        ? {
            id: feed.creator_id,
            username: feed.creator_username,
            display_name: feed.creator_display_name,
            avatar_url: feed.creator_avatar_url,
            bio: feed.creator_bio,
            links: [],
            created_at: "",
            updated_at: "",
        }
        : undefined;

    return {
        id: feed.id,
        user_id: feed.user_id,
        title: feed.title,
        description: feed.description,
        html_content: feed.html_content,
        css_content: feed.css_content,
        js_content: feed.js_content,
        thumbnail_url: feed.thumbnail_url,
        thumbnail_aspect_ratio: feed.thumbnail_aspect_ratio,
        tags: feed.tags,
        chat_messages: feed.chat_messages,
        is_published: feed.is_published,
        view_count: feed.view_count,
        like_count: feed.like_count,
        collect_count: feed.collect_count,
        comment_count: feed.comment_count,
        share_count: feed.share_count,
        created_at: feed.created_at,
        updated_at: feed.updated_at,
        creator,
        is_liked: feed.is_liked,
        is_collected: feed.is_collected,
    };
}
