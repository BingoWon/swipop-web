"use client";

import React from "react";
import {
    Button,
    Avatar,
    Divider,
    Chip,
    Textarea,
    ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { MainNavbar } from "@/components/layout/Navbar";
import type { Project, Comment, Profile } from "@/lib/types";

// Mock data - would be fetched from Supabase
const mockProject: Project = {
    id: "1",
    user_id: "1",
    title: "Neon Pulse Animation",
    description:
        "A mesmerizing neon animation effect using pure CSS. Features smooth infinite animations with gradient backgrounds and glowing effects.",
    html_content: `
    <div class="container">
      <div class="pulse"></div>
      <h1>Swipop</h1>
    </div>
  `,
    css_content: `
    body { margin: 0; }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    .pulse {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(45deg, #a855f7, #6366f1);
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 60px #a855f7;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }
    h1 {
      margin-top: 40px;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(90deg, #fff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 4px;
    }
  `,
    js_content: null,
    thumbnail_url: null,
    thumbnail_aspect_ratio: 1.0,
    tags: ["animation", "css", "neon", "pulse"],
    chat_messages: null,
    is_published: true,
    view_count: 1234,
    like_count: 567,
    collect_count: 45,
    comment_count: 89,
    share_count: 23,
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
    creator: {
        id: "1",
        username: "creative_dev",
        display_name: "Creative Developer",
        avatar_url: null,
        bio: "Building cool stuff with code",
        links: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
    },
    is_liked: false,
    is_collected: false,
};

const mockComments: Comment[] = [
    {
        id: "1",
        user_id: "2",
        project_id: "1",
        content: "This is absolutely stunning! Love the neon effect 🔥",
        parent_id: null,
        created_at: "2024-01-16",
        updated_at: "2024-01-16",
        user: {
            id: "2",
            username: "design_lover",
            display_name: "Design Lover",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
        },
    },
    {
        id: "2",
        user_id: "3",
        project_id: "1",
        content: "How did you achieve the glow effect? Would love to learn!",
        parent_id: null,
        created_at: "2024-01-17",
        updated_at: "2024-01-17",
        user: {
            id: "3",
            username: "css_beginner",
            display_name: "CSS Beginner",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
        },
    },
];

export default function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [project] = React.useState<Project>(mockProject);
    const [comments] = React.useState<Comment[]>(mockComments);
    const [isLiked, setIsLiked] = React.useState(project.is_liked || false);
    const [isCollected, setIsCollected] = React.useState(
        project.is_collected || false
    );
    const [likeCount, setLikeCount] = React.useState(project.like_count);
    const [newComment, setNewComment] = React.useState("");

    // Build the iframe srcDoc
    const srcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${project.css_content || ""}</style>
    </head>
    <body>
      ${project.html_content || ""}
      <script>${project.js_content || ""}</script>
    </body>
    </html>
  `;

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleCollect = () => {
        setIsCollected(!isCollected);
    };

    return (
        <div className="min-h-screen bg-background">
            <MainNavbar />

            <main className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Viewer */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Preview */}
                        <div className="rounded-large overflow-hidden border border-default-200 bg-content1">
                            <div className="aspect-video relative">
                                <iframe
                                    srcDoc={srcDoc}
                                    sandbox="allow-scripts"
                                    className="absolute inset-0 w-full h-full border-0"
                                    title={project.title}
                                />
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between p-4 rounded-large bg-content1 border border-default-200">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={isLiked ? "flat" : "light"}
                                    color={isLiked ? "danger" : "default"}
                                    startContent={
                                        <Icon
                                            icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                                        />
                                    }
                                    onPress={handleLike}
                                >
                                    {likeCount}
                                </Button>
                                <Button
                                    variant={isCollected ? "flat" : "light"}
                                    color={isCollected ? "warning" : "default"}
                                    startContent={
                                        <Icon
                                            icon={
                                                isCollected
                                                    ? "solar:bookmark-bold"
                                                    : "solar:bookmark-linear"
                                            }
                                        />
                                    }
                                    onPress={handleCollect}
                                >
                                    {project.collect_count}
                                </Button>
                                <Button
                                    variant="light"
                                    startContent={<Icon icon="solar:share-linear" />}
                                >
                                    {project.share_count}
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-default-400 text-small">
                                <Icon icon="solar:eye-linear" />
                                <span>{project.view_count} views</span>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="rounded-large bg-content1 border border-default-200 p-4">
                            <h3 className="text-lg font-medium mb-4">
                                Comments ({comments.length})
                            </h3>

                            {/* Comment Input */}
                            <div className="flex gap-3 mb-6">
                                <Avatar
                                    size="sm"
                                    showFallback
                                    name="U"
                                    className="flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <Textarea
                                        placeholder="Add a comment..."
                                        variant="bordered"
                                        minRows={2}
                                        value={newComment}
                                        onValueChange={setNewComment}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            color="primary"
                                            size="sm"
                                            isDisabled={!newComment.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Divider className="my-4" />

                            {/* Comments List */}
                            <ScrollShadow className="max-h-[400px]">
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar
                                                size="sm"
                                                showFallback
                                                name={
                                                    comment.user?.display_name?.[0] ||
                                                    comment.user?.username?.[0] ||
                                                    "U"
                                                }
                                                src={comment.user?.avatar_url || undefined}
                                                className="flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-small font-medium">
                                                        {comment.user?.display_name ||
                                                            comment.user?.username}
                                                    </span>
                                                    <span className="text-tiny text-default-400">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-small text-default-600 mt-1">
                                                    {comment.content}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Button variant="light" size="sm" isIconOnly>
                                                        <Icon icon="solar:heart-linear" />
                                                    </Button>
                                                    <Button variant="light" size="sm" isIconOnly>
                                                        <Icon icon="solar:chat-line-linear" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </div>
                    </div>

                    {/* Sidebar - Project Info */}
                    <div className="space-y-4">
                        {/* Title & Creator */}
                        <div className="rounded-large bg-content1 border border-default-200 p-4">
                            <h1 className="text-xl font-bold mb-2">{project.title}</h1>

                            <Link
                                href={`/profile/${project.creator?.username}`}
                                className="flex items-center gap-3 hover:bg-default-100 rounded-lg p-2 -mx-2 transition-colors"
                            >
                                <Avatar
                                    size="md"
                                    showFallback
                                    name={
                                        project.creator?.display_name?.[0] ||
                                        project.creator?.username?.[0] ||
                                        "U"
                                    }
                                    src={project.creator?.avatar_url || undefined}
                                />
                                <div>
                                    <p className="font-medium">
                                        {project.creator?.display_name ||
                                            project.creator?.username}
                                    </p>
                                    <p className="text-small text-default-400">
                                        @{project.creator?.username}
                                    </p>
                                </div>
                            </Link>

                            {project.description && (
                                <>
                                    <Divider className="my-4" />
                                    <p className="text-small text-default-600">
                                        {project.description}
                                    </p>
                                </>
                            )}

                            {project.tags && project.tags.length > 0 && (
                                <>
                                    <Divider className="my-4" />
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <Chip key={tag} size="sm" variant="flat">
                                                #{tag}
                                            </Chip>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="rounded-large bg-content1 border border-default-200 p-4">
                            <h3 className="text-medium font-medium mb-3">Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-medium bg-default-100">
                                    <p className="text-xl font-bold">{likeCount}</p>
                                    <p className="text-tiny text-default-400">Likes</p>
                                </div>
                                <div className="text-center p-3 rounded-medium bg-default-100">
                                    <p className="text-xl font-bold">{project.view_count}</p>
                                    <p className="text-tiny text-default-400">Views</p>
                                </div>
                                <div className="text-center p-3 rounded-medium bg-default-100">
                                    <p className="text-xl font-bold">{project.collect_count}</p>
                                    <p className="text-tiny text-default-400">Saves</p>
                                </div>
                                <div className="text-center p-3 rounded-medium bg-default-100">
                                    <p className="text-xl font-bold">{project.comment_count}</p>
                                    <p className="text-tiny text-default-400">Comments</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="rounded-large bg-content1 border border-default-200 p-4">
                            <Button
                                fullWidth
                                color="primary"
                                startContent={<Icon icon="solar:code-bold" />}
                            >
                                View Source Code
                            </Button>
                            <Button
                                fullWidth
                                variant="flat"
                                className="mt-2"
                                startContent={<Icon icon="solar:copy-linear" />}
                            >
                                Fork Project
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
