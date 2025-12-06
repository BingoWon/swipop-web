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
    Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Project } from "@/lib/types";

export default function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFollowing, setIsFollowing] = React.useState(false);
    const [username, setUsername] = React.useState<string>("");

    React.useEffect(() => {
        async function loadData() {
            const { username: u } = await params;
            setUsername(u);

            const supabase = createClient();

            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("username", u)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setLoading(false);
                return;
            }

            setProfile(profileData);

            // Fetch user's projects
            const { data: projectsData } = await supabase
                .from("projects")
                .select("*")
                .eq("user_id", profileData.id)
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            setProjects(projectsData || []);
            setLoading(false);
        }

        loadData();
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

    if (!profile) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-default-500">User not found</p>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="min-h-screen px-4 py-4">
                <div className="max-w-4xl mx-auto">
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
                                    {projects.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {projects.map((project) => (
                                                <ProjectCard key={project.id} project={project} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-default-400">
                                            <p>No projects yet</p>
                                        </div>
                                    )}
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
                                        <p>No liked projects</p>
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </SidebarLayout>
    );
}
