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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import type { Activity, Profile, Project } from "@/lib/types";

// Mock data
const mockActivities: (Activity & { actor?: Profile; project?: Project })[] = [
    {
        id: "1",
        user_id: "1",
        actor_id: "2",
        type: "like",
        project_id: "1",
        comment_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actor: {
            id: "2",
            username: "design_lover",
            display_name: "Design Lover",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "",
            updated_at: "",
        },
        project: {
            id: "1",
            user_id: "1",
            title: "Neon Pulse Animation",
            description: null,
            html_content: null,
            css_content: null,
            js_content: null,
            thumbnail_url: null,
            thumbnail_aspect_ratio: 1,
            tags: null,
            chat_messages: null,
            is_published: true,
            view_count: 0,
            like_count: 0,
            collect_count: 0,
            comment_count: 0,
            share_count: 0,
            created_at: "",
            updated_at: "",
        },
    },
    {
        id: "2",
        user_id: "1",
        actor_id: "3",
        type: "follow",
        project_id: null,
        comment_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        actor: {
            id: "3",
            username: "code_master",
            display_name: "Code Master",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "",
            updated_at: "",
        },
    },
    {
        id: "3",
        user_id: "1",
        actor_id: "4",
        type: "comment",
        project_id: "1",
        comment_id: "1",
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actor: {
            id: "4",
            username: "css_wizard",
            display_name: "CSS Wizard",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "",
            updated_at: "",
        },
        project: {
            id: "1",
            user_id: "1",
            title: "Neon Pulse Animation",
            description: null,
            html_content: null,
            css_content: null,
            js_content: null,
            thumbnail_url: null,
            thumbnail_aspect_ratio: 1,
            tags: null,
            chat_messages: null,
            is_published: true,
            view_count: 0,
            like_count: 0,
            collect_count: 0,
            comment_count: 0,
            share_count: 0,
            created_at: "",
            updated_at: "",
        },
    },
];

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
    const [activities] = React.useState(mockActivities);
    const unreadCount = activities.filter((a) => !a.is_read).length;

    return (
        <SidebarLayout>
            <div className="min-h-screen p-4 md:p-8">
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
                        <Tab
                            key="follows"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:users-group-rounded-bold" />
                                    <span>Follows</span>
                                </div>
                            }
                        />
                    </Tabs>

                    {/* Activities List */}
                    <Card>
                        <CardBody className="p-0">
                            <ScrollShadow className="max-h-[600px]">
                                {activities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon
                                            icon="solar:inbox-bold"
                                            className="text-5xl text-default-300 mx-auto mb-3"
                                        />
                                        <p className="text-default-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-default-100">
                                        {activities.map((activity) => {
                                            const config = activityConfig[activity.type];
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

                                                    {activity.project && (
                                                        <Link
                                                            href={`/project/${activity.project.id}`}
                                                            className="flex-shrink-0"
                                                        >
                                                            <div className="w-12 h-12 rounded-medium bg-default-100 flex items-center justify-center">
                                                                <Icon
                                                                    icon="solar:code-bold"
                                                                    className="text-default-400"
                                                                />
                                                            </div>
                                                        </Link>
                                                    )}

                                                    {activity.type === "follow" && (
                                                        <Button size="sm" color="primary" variant="flat">
                                                            Follow
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollShadow>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </SidebarLayout>
    );
}
