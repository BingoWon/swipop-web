"use client";

import React from "react";
import { Card, CardBody, CardFooter, Button, Chip, Image } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const [isLiked, setIsLiked] = React.useState(project.is_liked || false);
    const [likeCount, setLikeCount] = React.useState(project.like_count);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const aspectRatio = project.thumbnail_aspect_ratio || 0.75;
    const paddingTop = `${(1 / aspectRatio) * 100}%`;

    return (
        <Card
            as={Link}
            href={`/project/${project.id}`}
            className="border-small border-default-100 hover:border-primary transition-colors"
            shadow="sm"
            isPressable
        >
            <CardBody className="p-0 overflow-hidden">
                <div className="relative bg-default-100" style={{ paddingTop }}>
                    {project.thumbnail_url ? (
                        <Image
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            src={project.thumbnail_url}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                            <Icon
                                icon="solar:code-bold"
                                className="text-4xl text-default-400"
                            />
                        </div>
                    )}
                </div>
            </CardBody>

            <CardFooter className="flex-col items-start gap-2 px-3 py-3">
                <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-small font-medium truncate">
                            {project.title || "Untitled"}
                        </p>
                        {project.creator && (
                            <p className="text-tiny text-default-400 truncate">
                                by {project.creator.display_name || project.creator.username}
                            </p>
                        )}
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={handleLike as unknown as () => void}
                        className={isLiked ? "text-danger" : "text-default-400"}
                    >
                        <Icon
                            icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                            className="text-lg"
                        />
                    </Button>
                </div>

                <div className="flex w-full items-center justify-between">
                    <div className="flex gap-3 text-tiny text-default-400">
                        <span className="flex items-center gap-1">
                            <Icon icon="solar:heart-bold" />
                            {likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <Icon icon="solar:eye-bold" />
                            {project.view_count}
                        </span>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                        <Chip size="sm" variant="flat" className="text-tiny">
                            {project.tags[0]}
                        </Chip>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
