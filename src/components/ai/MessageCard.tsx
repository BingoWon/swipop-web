"use client";

import { Avatar, Card, CardBody, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { type Message, type Segment } from "@/app/(main)/create/layout";

// Constants
const AI_AVATAR_URL = "https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png";

// Tool icons matching iOS ToolCallView.swift
const TOOL_ICONS: Record<string, string> = {
	write_html: "solar:code-bold",
	write_css: "solar:pallete-2-bold",
	write_javascript: "solar:programming-bold",
	replace_in_html: "solar:code-bold",
	replace_in_css: "solar:pallete-2-bold",
	replace_in_javascript: "solar:programming-bold",
	update_metadata: "solar:document-text-bold",
	summarize_conversation: "solar:document-text-bold",
};

// Re-export types from layout for convenience
export type { Message, Segment };

interface MessageCardProps {
	message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
			{!isUser && <Avatar src={AI_AVATAR_URL} showFallback name="AI" size="sm" className="shrink-0" />}

			<div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
				{message.segments.map((segment, i) => renderSegment(segment, i, isUser))}
			</div>

			{isUser && <Avatar showFallback name="U" size="sm" className="shrink-0 bg-primary" />}
		</div>
	);
}

function renderSegment(segment: Segment, index: number, isUser: boolean) {
	switch (segment.type) {
		case "text":
			if (!segment.content) return null;
			return (
				<div key={index} className={cn("rounded-medium px-4 py-3", isUser ? "bg-primary text-primary-foreground" : "bg-content2")}>
					<p className="text-small whitespace-pre-wrap">{segment.content}</p>
				</div>
			);

		case "thinking":
			return <ThinkingSegment key={index} text={segment.content} isActive={segment.isActive} startTime={segment.startTime} />;

		case "tool_call":
			return <ToolCallSegment key={segment.id} segment={segment} />;

		default:
			return null;
	}
}

interface ToolCallSegmentProps {
	segment: Extract<Segment, { type: "tool_call" }>;
}

/**
 * Tool call segment - matches iOS ToolCallView.swift
 * Uses "Calling/Called" text pattern, displays full tool name
 */
function ToolCallSegment({ segment }: ToolCallSegmentProps) {
	const { name, arguments: args, isStreaming, result } = segment;
	const isComplete = !isStreaming && result !== undefined;
	const icon = TOOL_ICONS[name] || "solar:widget-bold";

	const [isExpanded, setIsExpanded] = useState(false);
	const hasContent = args.length > 0;

	return (
		<Card
			className={cn(
				"border overflow-hidden",
				isComplete ? "border-success/30 bg-content2" : "border-warning/40 bg-content2",
			)}
			isPressable={hasContent}
			onPress={() => hasContent && setIsExpanded(!isExpanded)}
		>
			{/* Header - matches iOS layout */}
			<div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
				<Icon
					icon={icon}
					className={cn("text-base shrink-0", isStreaming ? "text-warning" : "text-success")}
				/>
				<span className="text-small font-medium whitespace-nowrap shrink-0">
					{isStreaming ? `Calling ${name}...` : `Called ${name}`}
				</span>
				{isStreaming && (
					<div className="w-3 h-3 border-2 border-warning border-t-transparent rounded-full animate-spin shrink-0" />
				)}
				{hasContent && (
					<Icon
						icon="solar:alt-arrow-right-linear"
						className={cn("text-default-400 ml-auto shrink-0 transition-transform", isExpanded && "rotate-90")}
					/>
				)}
			</div>

			{/* Expanded content - matches iOS */}
			{isExpanded && hasContent && (
				<>
					<div className="border-t border-divider px-3 py-2">
						<p className="text-tiny text-default-500 mb-1">{isStreaming ? "Arguments (streaming...)" : "Arguments"}</p>
						<pre className="text-tiny font-mono text-foreground/80 whitespace-pre-wrap max-h-[200px] overflow-auto">{args}</pre>
					</div>
					{result && (
						<div className="border-t border-divider px-3 py-2">
							<p className="text-tiny text-default-500 mb-1">Result</p>
							<pre className="text-tiny font-mono text-success whitespace-pre-wrap">{result}</pre>
						</div>
					)}
				</>
			)}
		</Card>
	);
}

interface ThinkingSegmentProps {
	text: string;
	isActive: boolean;
	startTime: number;
}

function ThinkingSegment({ text, isActive, startTime }: ThinkingSegmentProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	// For historical thinking (startTime=0), don't show elapsed time
	const [elapsed, setElapsed] = useState(() => startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0);

	useEffect(() => {
		if (!isActive || startTime === 0) return;
		const update = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
		update();
		const id = setInterval(update, 1000);
		return () => clearInterval(id);
	}, [isActive, startTime]);

	return (
		<Card
			className={cn("cursor-pointer transition-colors border", isActive ? "bg-primary/10 border-primary/30" : "bg-content2/50 border-divider")}
			isPressable={!!text}
			onPress={() => text && setIsExpanded(!isExpanded)}
		>
			<div className="flex items-center gap-2 px-3 py-2.5">
				<Icon icon="solar:brain-bold" className={cn("text-base shrink-0", isActive ? "text-primary animate-pulse" : "text-primary/80")} />
				<span className="text-small font-medium whitespace-nowrap">
					{isActive ? `Thinking ${elapsed}s` : (startTime > 0 ? `Thought for ${elapsed}s` : "Thought")}
				</span>
				{isActive && <ShimmerBar />}
				{text && <Icon icon="solar:alt-arrow-right-linear" className={cn("text-default-400 ml-auto shrink-0 transition-transform", isExpanded && "rotate-90")} />}
			</div>
			{isExpanded && text && (
				<div className="border-t border-divider px-3 py-2">
					<p className="text-tiny text-default-500 whitespace-pre-wrap max-h-[200px] overflow-auto">{text}</p>
				</div>
			)}
		</Card>
	);
}

function ShimmerBar() {
	return (
		<div className="relative w-10 h-1 bg-primary/30 rounded-full overflow-hidden shrink-0">
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
		</div>
	);
}

export function TypingIndicator() {
	return (
		<div className="flex gap-3">
			<Avatar src={AI_AVATAR_URL} size="sm" className="shrink-0" />
			<div className="rounded-medium bg-content2 px-4 py-3 animate-pulse">
				<div className="flex gap-1">
					{[0, 150, 300].map((delay) => (
						<span key={delay} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
					))}
				</div>
			</div>
		</div>
	);
}
