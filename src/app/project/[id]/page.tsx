"use client";

import React from "react";
import { Button, Avatar, Chip, Spinner, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { createClient } from "@/lib/supabase/client";
import type { Project, Profile, Comment } from "@/lib/types";

export default function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [project, setProject] = React.useState<
        Project & { creator?: Profile }
        | null>(null);
    const [comments, setComments] = React.useState<(Comment & { profile?: Profile })[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isLiked, setIsLiked] = React.useState(false);
    const [isCollected, setIsCollected] = React.useState(false);

    React.useEffect(() => {
        async function loadProject() {
            const { id } = await params;
            const supabase = createClient();

            // Fetch project with creator
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
            const { data: commentsData } = await supabase
                .from("comments")
                .select(`
          *,
          profile:profiles!comments_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .eq("project_id", id)
                .order("created_at", { ascending: false });

            setComments(commentsData || []);
            setLoading(false);
        }

        loadProject();
    }, [params]);

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

    // Build preview HTML
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
                    <div className="w-full lg:w-96 border-l border-default-200 bg-background">
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
                                <Button color="primary" size="sm">
                                    Follow
                                </Button>
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
                                    onPress={() => setIsLiked(!isLiked)}
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
                                    onPress={() => setIsCollected(!isCollected)}
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
                                                        <span className="font-medium">
                                                            {comment.profile?.display_name ||
                                                                comment.profile?.username}
                                                        </span>
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
