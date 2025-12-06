"use client";

import React from "react";
import { Input, Button, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export default function SearchPage() {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<Project[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        const supabase = createClient();

        const { data, error } = await supabase
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
            .eq("is_published", true)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Search error:", error);
        } else {
            setResults(data || []);
        }

        setIsSearching(false);
    };

    const handleTagSearch = (tag: string) => {
        setQuery(tag);
        // Trigger search with tag
        setTimeout(handleSearch, 0);
    };

    return (
        <SidebarLayout>
            <div className="min-h-screen px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    {/* Search Header */}
                    <div className="mb-8">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search projects..."
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
                                                setHasSearched(false);
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

                    {/* Search Results or Empty State */}
                    {isSearching ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : hasSearched ? (
                        results.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-small text-default-400">
                                        {results.length} projects found
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {results.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Icon
                                    icon="solar:minimalistic-magnifer-broken"
                                    className="text-6xl text-default-300 mx-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">No results found</h3>
                                <p className="text-default-400">
                                    Try a different search term
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 text-default-400">
                            <Icon
                                icon="solar:magnifer-linear"
                                className="text-6xl text-default-300 mx-auto mb-4"
                            />
                            <p>Search for projects by title or description</p>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
