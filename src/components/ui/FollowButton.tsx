"use client";

import { Button } from "@heroui/react";

interface FollowButtonProps {
    isFollowing: boolean;
    onPress: () => void;
    className?: string;
}

export function FollowButton({ isFollowing, onPress, className }: FollowButtonProps) {
    return (
        <Button
            size="sm"
            color={isFollowing ? "default" : "primary"}
            variant={isFollowing ? "bordered" : "solid"}
            onPress={onPress}
            className={`shrink-0 ${className || ""}`}
        >
            {isFollowing ? "Following" : "Follow"}
        </Button>
    );
}
