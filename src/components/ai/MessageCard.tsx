"use client";

import { Avatar, cn } from "@heroui/react";

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface MessageCardProps {
	message: ChatMessage;
}

/**
 * Chat message bubble component
 * Displays user messages on right (primary color) and AI messages on left
 */
export function MessageCard({ message }: MessageCardProps) {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
			<Avatar
				src={
					isUser
						? undefined
						: "https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png"
				}
				showFallback
				name={isUser ? "U" : "AI"}
				size="sm"
				className={cn("shrink-0", isUser && "bg-primary")}
			/>
			<div
				className={cn(
					"rounded-medium px-4 py-3 max-w-[80%]",
					isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-content2",
				)}
			>
				<p className="text-small whitespace-pre-wrap">{message.content}</p>
			</div>
		</div>
	);
}

/**
 * Typing indicator for AI responses
 */
export function TypingIndicator() {
	return (
		<div className="flex gap-3">
			<Avatar
				src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png"
				size="sm"
				className="shrink-0"
			/>
			<div className="rounded-medium bg-content2 px-4 py-3 animate-pulse">
				<div className="flex gap-1">
					<span
						className="w-2 h-2 bg-primary rounded-full animate-bounce"
						style={{ animationDelay: "0ms" }}
					/>
					<span
						className="w-2 h-2 bg-primary rounded-full animate-bounce"
						style={{ animationDelay: "150ms" }}
					/>
					<span
						className="w-2 h-2 bg-primary rounded-full animate-bounce"
						style={{ animationDelay: "300ms" }}
					/>
				</div>
			</div>
		</div>
	);
}
