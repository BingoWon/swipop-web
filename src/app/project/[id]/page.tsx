"use client";

import React from "react";
import { Button, Avatar, Chip, Spinner, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { InteractionService } from "@/lib/services/interaction";
import { CommentService } from "@/lib/services/comment";
import { UserService } from "@/lib/services/user";
import type { Project, Profile, Comment } from "@/lib/types";

export default function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { user } = useAuth();
    const [project, setProject] = React.useState<Project & { creator?: Profile } | null>(null);
    const [comments, setComments] = React.useState<(Comment & { profile?: Profile })[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isLiked, setIsLiked] = React.useState(false);
    const [isCollected, setIsCollected] = React.useState(false);
    const [isFollowing, setIsFollowing] = React.useState(false);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        async function loadProject() {
            const { id } = await params;
            const supabase = createClient();

            const { data: projectData, error } = await supabase
                .from("projects")
                .select(`
          *,
          creator:profiles!projects_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching project:", error);
                setLoading(false);
                return;
            }

            setProject(projectData);

            // Fetch comments
            const commentsData = await CommentService.fetchComments(id);
            setComments(commentsData);

            // Check user interactions
            if (user) {
                const [liked, collected] = await Promise.all([
                    InteractionService.isLiked(id, user.id),
                    InteractionService.isCollected(id, user.id),
                ]);
                setIsLiked(liked);
                setIsCollected(collected);

                if (projectData.creator) {
                    const following = await UserService.isFollowing(user.id, projectData.creator.id);
                    setIsFollowing(following);
                }
            }

            setLoading(false);
        }

        loadProject();
    }, [params, user]);

    const handleLike = async () => {
        if (!user || !project) return;
        const newIsLiked = await InteractionService.toggleLike(project.id, user.id);
        setIsLiked(newIsLiked);
        setProject({
            ...project,
            like_count: newIsLiked ? project.like_count + 1 : project.like_count - 1,
        });
    };

    const handleCollect = async () => {
        if (!user || !project) return;
        const newIsCollected = await InteractionService.toggleCollect(project.id, user.id);
        setIsCollected(newIsCollected);
        setProject({
            ...project,
            collect_count: newIsCollected ? project.collect_count + 1 : project.collect_count - 1,
        });
    };

    const handleFollow = async () => {
        if (!user || !project?.creator) return;
        const newIsFollowing = await UserService.toggleFollow(user.id, project.creator.id);
        setIsFollowing(newIsFollowing);
    };

    const handleSubmitComment = async () => {
        if (!user || !project || !newComment.trim()) return;

        setIsSubmitting(true);
        const comment = await CommentService.createComment(project.id, user.id, newComment);
        if (comment) {
            setComments([comment, ...comments]);
            setNewComment("");
            setProject({
                ...project,
                comment_count: project.comment_count + 1,
            });
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            </SidebarLayout>
        );
    }

    if (!project) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-default-500">Project not found</p>
                </div>
            </SidebarLayout>
        );
    }

    const previewSrcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${project.css_content || ""}</style>
    </head>
    <body style="margin:0">
      ${project.html_content || ""}
      <script>${project.js_content || ""}</script>
    </body>
    </html>
  `;

    return (
        <SidebarLayout>
            <div className="min-h-screen">
                <div className="flex flex-col lg:flex-row">
                    {/* Preview Area */}
                    <div className="flex-1 bg-black">
                        <div className="aspect-video lg:h-screen">
                            <iframe
                                srcDoc={previewSrcDoc}
                                sandbox="allow-scripts"
                                className="w-full h-full border-0"
                                title={project.title || "Project Preview"}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 border-l border-default-200 bg-background overflow-auto">
                        <div className="p-4">
                            {/* Creator Info */}
                            <div className="flex items-center gap-3 mb-4">
                                <Link href={`/profile/${project.creator?.username}`}>
                                    <Avatar
                                        size="md"
                                        showFallback
                                        name={project.creator?.display_name?.[0] || "U"}
                                        src={project.creator?.avatar_url || undefined}
                                    />
                                </Link>
                                <div className="flex-1">
                                    <Link
                                        href={`/profile/${project.creator?.username}`}
                                        className="font-medium hover:underline"
                                    >
                                        {project.creator?.display_name || project.creator?.username}
                                    </Link>
                                    <p className="text-small text-default-400">
                                        @{project.creator?.username}
                                    </p>
                                </div>
                                {user && project.creator && user.id !== project.creator.id && (
                                    <Button
                                        color={isFollowing ? "default" : "primary"}
                                        variant={isFollowing ? "bordered" : "solid"}
                                        size="sm"
                                        onPress={handleFollow}
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </Button>
                                )}
                            </div>

                            {/* Title & Description */}
                            <h1 className="text-xl font-bold mb-2">
                                {project.title || "Untitled"}
                            </h1>
                            {project.description && (
                                <p className="text-default-500 text-small mb-4">
                                    {project.description}
                                </p>
                            )}

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map((tag) => (
                                        <Chip key={tag} size="sm" variant="flat">
                                            #{tag}
                                        </Chip>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mb-6">
                                <Button
                                    variant={isLiked ? "solid" : "bordered"}
                                    color={isLiked ? "danger" : "default"}
                                    startContent={
                                        <Icon icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"} />
                                    }
                                    onPress={handleLike}
                                    isDisabled={!user}
                                >
                                    {project.like_count || 0}
                                </Button>
                                <Button
                                    variant={isCollected ? "solid" : "bordered"}
                                    color={isCollected ? "warning" : "default"}
                                    startContent={
                                        <Icon
                                            icon={isCollected ? "solar:bookmark-bold" : "solar:bookmark-linear"}
                                        />
                                    }
                                    onPress={handleCollect}
                                    isDisabled={!user}
                                >
                                    Save
                                </Button>
                                <Button variant="bordered" isIconOnly>
                                    <Icon icon="solar:share-linear" />
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-small text-default-400 mb-6">
                                <span>{project.view_count || 0} views</span>
                                <span>{project.comment_count || 0} comments</span>
                            </div>

                            {/* Comment Input */}
                            {user && (
                                <div className="mb-6">
                                    <Textarea
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onValueChange={setNewComment}
                                        minRows={2}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onPress={handleSubmitComment}
                                            isLoading={isSubmitting}
                                            isDisabled={!newComment.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            <div>
                                <h3 className="font-medium mb-4">Comments</h3>
                                {comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar
                                                    size="sm"
                                                    showFallback
                                                    name={comment.profile?.display_name?.[0] || "U"}
                                                    src={comment.profile?.avatar_url || undefined}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-small">
                                                        <Link
                                                            href={`/profile/${comment.profile?.username}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {comment.profile?.display_name || comment.profile?.username}
                                                        </Link>
                                                    </p>
                                                    <p className="text-small text-default-500">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-small text-default-400">No comments yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
