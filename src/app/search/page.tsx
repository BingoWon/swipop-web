"use client";

import React from "react";
import {
    Input,
    Button,
    Card,
    CardBody,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Chip,
    ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { MainNavbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/lib/types";

const trendingTags = [
    "animation",
    "css",
    "3d",
    "gradient",
    "glassmorphism",
    "dark-mode",
    "interactive",
    "particles",
];

const mockSearchResults: Project[] = [
    {
        id: "1",
        user_id: "1",
        title: "Neon Pulse Animation",
        description: "A mesmerizing neon animation effect",
        html_content: null,
        css_content: null,
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
        creator: {
            id: "1",
            username: "creative_dev",
            display_name: "Creative Developer",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "",
            updated_at: "",
        },
    },
    {
        id: "2",
        user_id: "2",
        title: "Glassmorphism Card",
        description: "Beautiful glassmorphism effect",
        html_content: null,
        css_content: null,
        js_content: null,
        thumbnail_url: null,
        thumbnail_aspect_ratio: 0.8,
        tags: ["glassmorphism", "css", "card"],
        chat_messages: null,
        is_published: true,
        view_count: 2345,
        like_count: 890,
        collect_count: 78,
        comment_count: 123,
        share_count: 45,
        created_at: "2024-02-01",
        updated_at: "2024-02-01",
        creator: {
            id: "2",
            username: "ui_master",
            display_name: "UI Master",
            avatar_url: null,
            bio: null,
            links: [],
            created_at: "",
            updated_at: "",
        },
    },
];

export default function SearchPage() {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<Project[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    const handleSearch = () => {
        if (!query.trim()) return;
        setIsSearching(true);
        // Simulate search
        setTimeout(() => {
            setResults(mockSearchResults);
            setIsSearching(false);
        }, 500);
    };

    const handleTagClick = (tag: string) => {
        setQuery(tag);
        setResults(mockSearchResults);
    };

    return (
        <div className="min-h-screen bg-background">
            <MainNavbar />

            <main className="max-w-4xl mx-auto p-4">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search projects, creators, tags..."
                            value={query}
                            onValueChange={setQuery}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            size="lg"
                            startContent={
                                <Icon icon="solar:magnifer-linear" className="text-default-400" />
                            }
                            endContent={
                                query && (
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => {
                                            setQuery("");
                                            setResults([]);
                                        }}
                                    >
                                        <Icon icon="solar:close-circle-bold" />
                                    </Button>
                                )
                            }
                        />
                        <Button
                            color="primary"
                            size="lg"
                            onPress={handleSearch}
                            isLoading={isSearching}
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {/* Trending Tags */}
                {results.length === 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4">Trending Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    variant="flat"
                                    className="cursor-pointer hover:bg-default-200 transition-colors"
                                    onClick={() => handleTagClick(tag)}
                                    startContent={<Icon icon="solar:hashtag-linear" />}
                                >
                                    {tag}
                                </Chip>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Searches */}
                {results.length === 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4">Recent Searches</h2>
                        <div className="space-y-2">
                            {["neon animation", "gradient background", "loading spinner"].map(
                                (search) => (
                                    <Button
                                        key={search}
                                        variant="light"
                                        className="justify-start w-full"
                                        startContent={<Icon icon="solar:clock-circle-linear" />}
                                        onPress={() => handleTagClick(search)}
                                    >
                                        {search}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {results.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">
                                Results for &quot;{query}&quot;
                            </h2>
                            <span className="text-small text-default-400">
                                {results.length} projects found
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {results.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {query && results.length === 0 && !isSearching && (
                    <div className="text-center py-12">
                        <Icon
                            icon="solar:minimalistic-magnifer-broken"
                            className="text-6xl text-default-300 mx-auto mb-4"
                        />
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p className="text-default-400">
                            Try searching for something else or browse trending tags
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
