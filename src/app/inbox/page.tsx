"use client";

import React from "react";
import {
    Card,
    CardBody,
    Avatar,
    Button,
    Tabs,
    Tab,
    Chip,
    ScrollShadow,
    Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { createClient } from "@/lib/supabase/client";
import type { Activity, Profile, Project } from "@/lib/types";

const activityConfig = {
    like: {
        icon: "solar:heart-bold",
        color: "text-danger",
        text: "liked your project",
    },
    comment: {
        icon: "solar:chat-round-dots-bold",
        color: "text-primary",
        text: "commented on your project",
    },
    follow: {
        icon: "solar:user-plus-bold",
        color: "text-success",
        text: "started following you",
    },
    collect: {
        icon: "solar:bookmark-bold",
        color: "text-warning",
        text: "saved your project",
    },
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function InboxPage() {
    const [activities, setActivities] = React.useState<
        (Activity & { actor?: Profile; project?: Project })[]
    >([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchActivities() {
            const supabase = createClient();

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch activities for current user
            const { data, error } = await supabase
                .from("activities")
                .select(`
          *,
          actor:profiles!activities_actor_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          ),
          project:projects!activities_project_id_fkey (
            id,
            title
          )
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching activities:", error);
            } else {
                setActivities(data || []);
            }

            setLoading(false);
        }

        fetchActivities();
    }, []);

    const unreadCount = activities.filter((a) => !a.is_read).length;

    return (
        <SidebarLayout>
            <div className="min-h-screen px-4 py-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Inbox</h1>
                            {unreadCount > 0 && (
                                <Chip color="primary" size="sm">
                                    {unreadCount} new
                                </Chip>
                            )}
                        </div>
                        <Button variant="light" size="sm">
                            Mark all as read
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs fullWidth className="mb-4">
                        <Tab
                            key="all"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:inbox-bold" />
                                    <span>All</span>
                                </div>
                            }
                        />
                        <Tab
                            key="likes"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:heart-bold" />
                                    <span>Likes</span>
                                </div>
                            }
                        />
                        <Tab
                            key="comments"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:chat-round-dots-bold" />
                                    <span>Comments</span>
                                </div>
                            }
                        />
                    </Tabs>

                    {/* Activities List */}
                    <Card>
                        <CardBody className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-12">
                                    <Icon
                                        icon="solar:inbox-bold"
                                        className="text-5xl text-default-300 mx-auto mb-3"
                                    />
                                    <p className="text-default-400">No notifications yet</p>
                                </div>
                            ) : (
                                <ScrollShadow className="max-h-[600px]">
                                    <div className="divide-y divide-default-100">
                                        {activities.map((activity) => {
                                            const config =
                                                activityConfig[
                                                activity.type as keyof typeof activityConfig
                                                ] || activityConfig.like;
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className={`flex items-start gap-3 p-4 hover:bg-default-50 transition-colors ${!activity.is_read ? "bg-primary-50/30" : ""
                                                        }`}
                                                >
                                                    {!activity.is_read && (
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                                                    )}

                                                    <div className="relative flex-shrink-0">
                                                        <Avatar
                                                            size="md"
                                                            showFallback
                                                            name={
                                                                activity.actor?.display_name?.[0] ||
                                                                activity.actor?.username?.[0] ||
                                                                "U"
                                                            }
                                                            src={activity.actor?.avatar_url || undefined}
                                                        />
                                                        <div
                                                            className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-content1 border-2 border-background ${config.color}`}
                                                        >
                                                            <Icon icon={config.icon} className="text-xs" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-small">
                                                            <Link
                                                                href={`/profile/${activity.actor?.username}`}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {activity.actor?.display_name ||
                                                                    activity.actor?.username}
                                                            </Link>
                                                            <span className="text-default-500">
                                                                {" "}
                                                                {config.text}
                                                            </span>
                                                            {activity.project && (
                                                                <Link
                                                                    href={`/project/${activity.project.id}`}
                                                                    className="font-medium hover:underline"
                                                                >
                                                                    {" "}
                                                                    {activity.project.title}
                                                                </Link>
                                                            )}
                                                        </p>
                                                        <p className="text-tiny text-default-400 mt-1">
                                                            {formatTimeAgo(activity.created_at)}
                                                        </p>
                                                    </div>

                                                    {activity.type === "follow" && (
                                                        <Button size="sm" color="primary" variant="flat">
                                                            Follow
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollShadow>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </SidebarLayout>
    );
}
