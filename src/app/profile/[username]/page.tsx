"use client";

import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Avatar,
    Tabs,
    Tab,
    Chip,
    Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { MainNavbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/project/ProjectCard";
import type { Profile, Project } from "@/lib/types";

// This would be fetched from Supabase in a real implementation
const mockProfile: Profile = {
    id: "1",
    username: "creative_dev",
    display_name: "Creative Developer",
    avatar_url: null,
    bio: "Building cool stuff with code ✨ Creator of interactive web experiences.",
    links: [
        { title: "GitHub", url: "https://github.com" },
        { title: "Twitter", url: "https://twitter.com" },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
};

const mockProjects: Project[] = [
    {
        id: "1",
        user_id: "1",
        title: "Neon Pulse Animation",
        description: "A mesmerizing neon animation effect",
        html_content: "<div class='pulse'></div>",
        css_content: ".pulse { animation: pulse 2s infinite; }",
        js_content: null,
        thumbnail_url: null,
        thumbnail_aspect_ratio: 1.0,
        tags: ["animation", "css", "neon"],
        chat_messages: null,
        is_published: true,
        view_count: 1234,
        like_count: 567,
        collect_count: 45,
        comment_count: 89,
        share_count: 23,
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
    },
    {
        id: "2",
        user_id: "1",
        title: "Particle Storm",
        description: "Interactive particle system with canvas",
        html_content: "<canvas id='canvas'></canvas>",
        css_content: "canvas { width: 100%; height: 100%; }",
        js_content: "// particle code",
        thumbnail_url: null,
        thumbnail_aspect_ratio: 0.75,
        tags: ["particles", "canvas", "javascript"],
        chat_messages: null,
        is_published: true,
        view_count: 2345,
        like_count: 890,
        collect_count: 78,
        comment_count: 123,
        share_count: 45,
        created_at: "2024-02-01",
        updated_at: "2024-02-01",
    },
];

export default function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const [profile] = React.useState<Profile | null>(mockProfile);
    const [projects] = React.useState<Project[]>(mockProjects);
    const [isFollowing, setIsFollowing] = React.useState(false);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <MainNavbar />
                <div className="max-w-4xl mx-auto p-4">
                    <Skeleton className="h-[200px] rounded-large" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <MainNavbar />

            <main className="max-w-4xl mx-auto p-4">
                <Card className="w-full">
                    <CardHeader className="relative flex h-[120px] flex-col justify-end overflow-visible bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400">
                        <Avatar
                            className="h-24 w-24 translate-y-12 text-large"
                            showFallback
                            name={profile.display_name || profile.username || "U"}
                            src={profile.avatar_url || undefined}
                        />
                        <Button
                            className="absolute top-3 right-3 bg-white/20 text-white dark:bg-black/20"
                            radius="full"
                            size="sm"
                            variant="light"
                            startContent={<Icon icon="solar:pen-bold" />}
                        >
                            Edit Profile
                        </Button>
                    </CardHeader>

                    <CardBody>
                        <div className="pt-8 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-large font-medium">
                                        {profile.display_name || profile.username}
                                    </p>
                                    <p className="text-small text-default-400">
                                        @{profile.username}
                                    </p>
                                </div>
                                <Button
                                    color={isFollowing ? "default" : "primary"}
                                    variant={isFollowing ? "bordered" : "solid"}
                                    onPress={() => setIsFollowing(!isFollowing)}
                                    startContent={
                                        isFollowing ? (
                                            <Icon icon="solar:check-circle-bold" />
                                        ) : (
                                            <Icon icon="solar:user-plus-bold" />
                                        )
                                    }
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                            </div>

                            {profile.bio && (
                                <p className="text-small text-foreground py-3">{profile.bio}</p>
                            )}

                            {profile.links && profile.links.length > 0 && (
                                <div className="flex gap-2 py-2 flex-wrap">
                                    {profile.links.map((link, i) => (
                                        <Chip
                                            key={i}
                                            variant="flat"
                                            as="a"
                                            href={link.url}
                                            target="_blank"
                                            startContent={<Icon icon="solar:link-bold" />}
                                        >
                                            {link.title}
                                        </Chip>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <p>
                                    <span className="text-small text-default-500 font-medium">
                                        {projects.length}
                                    </span>
                                    &nbsp;
                                    <span className="text-small text-default-400">Projects</span>
                                </p>
                                <p>
                                    <span className="text-small text-default-500 font-medium">
                                        128
                                    </span>
                                    &nbsp;
                                    <span className="text-small text-default-400">Following</span>
                                </p>
                                <p>
                                    <span className="text-small text-default-500 font-medium">
                                        2.5K
                                    </span>
                                    &nbsp;
                                    <span className="text-small text-default-400">Followers</span>
                                </p>
                            </div>
                        </div>

                        <Tabs
                            fullWidth
                            classNames={{
                                panel: "mt-4",
                            }}
                        >
                            <Tab
                                key="projects"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:code-bold" />
                                        <span>Projects</span>
                                    </div>
                                }
                            >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {projects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            </Tab>
                            <Tab
                                key="likes"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:heart-bold" />
                                        <span>Likes</span>
                                    </div>
                                }
                            >
                                <div className="text-center py-8 text-default-400">
                                    <Icon
                                        icon="solar:heart-broken-bold"
                                        className="text-4xl mx-auto mb-2"
                                    />
                                    <p>No liked projects yet</p>
                                </div>
                            </Tab>
                            <Tab
                                key="collections"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:bookmark-bold" />
                                        <span>Collections</span>
                                    </div>
                                }
                            >
                                <div className="text-center py-8 text-default-400">
                                    <Icon
                                        icon="solar:bookmark-bold"
                                        className="text-4xl mx-auto mb-2"
                                    />
                                    <p>No collections yet</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </main>
        </div>
    );
}
