"use client";

import { Avatar, Card, CardBody, Chip, cn, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

// Constants
const AI_AVATAR_URL = "https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png";

const TOOL_CONFIG: Record<string, { icon: string; label: string }> = {
	write_html: { icon: "solar:code-bold", label: "HTML" },
	write_css: { icon: "solar:pallete-2-bold", label: "CSS" },
	write_javascript: { icon: "solar:programming-bold", label: "JavaScript" },
	replace_in_html: { icon: "solar:code-bold", label: "HTML" },
	replace_in_css: { icon: "solar:pallete-2-bold", label: "CSS" },
	replace_in_javascript: { icon: "solar:programming-bold", label: "JavaScript" },
	update_metadata: { icon: "solar:document-text-bold", label: "Metadata" },
	summarize_conversation: { icon: "solar:document-text-bold", label: "Summary" },
};

// Types matching ChatPanel Message structure
type Segment =
	| { type: "text"; content: string }
	| { type: "thinking"; content: string; isActive: boolean; duration?: number }
	| { type: "tool_call"; id: string; name: string; arguments: string; result?: string; isStreaming: boolean };

interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	segments: Segment[];
	isStreaming?: boolean;
}

interface MessageCardProps {
	message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
			{!isUser && <Avatar src={AI_AVATAR_URL} showFallback name="AI" size="sm" className="shrink-0" />}

			<div className={cn("flex flex-col gap-2 max-w-[85%]", isUser ? "items-end" : "items-start")}>
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
			return <ThinkingSegment key={index} text={segment.content} isActive={segment.isActive} />;

		case "tool_call":
			return <ToolCallSegment key={segment.id} segment={segment} />;

		default:
			return null;
	}
}

interface ToolCallSegmentProps {
	segment: Extract<Segment, { type: "tool_call" }>;
}

function ToolCallSegment({ segment }: ToolCallSegmentProps) {
	const { name, isStreaming, result } = segment;
	const isComplete = !isStreaming && result !== undefined;
	const config = TOOL_CONFIG[name] || { icon: "solar:widget-bold", label: name };

	const actionPrefix = name.startsWith("write_") ? "Writing" : name.startsWith("replace_in_") ? "Editing" : "Updating";
	const statusText = isComplete ? `Called ${config.label}` : `${actionPrefix} ${config.label}...`;
	const resultText = isComplete ? parseToolResult(result) : "";

	return (
		<Card className={cn("bg-content2 border", isComplete ? "border-success/30" : "border-warning/40")}>
			<CardBody className="p-3">
				<div className="flex items-center gap-2">
					<Icon
						icon={isComplete ? "solar:check-circle-bold" : "solar:refresh-bold"}
						className={cn("text-lg", isComplete ? "text-success" : "text-warning animate-spin")}
					/>
					<Icon icon={config.icon} className="text-default-500" />
					<span className="text-small font-medium">{statusText}</span>
					{!isComplete && <Progress size="sm" isIndeterminate color="warning" className="max-w-[60px]" />}
					{resultText && (
						<Chip size="sm" variant="flat" color="success" className="ml-auto">
							{resultText}
						</Chip>
					)}
				</div>
			</CardBody>
		</Card>
	);
}

function parseToolResult(result?: string): string {
	if (!result) return "";
	try {
		const obj = JSON.parse(result);
		if (!obj.success) return obj.error || "";
		if (typeof obj.lines === "number") return `${obj.lines} lines`;
		if (typeof obj.replaced === "number") return "1 change";
		if (obj.action === "conversation_summarized") return "Compacted";
		return "Done";
	} catch {
		return "Done";
	}
}

interface ThinkingSegmentProps {
	text: string;
	isActive: boolean;
}

function ThinkingSegment({ text, isActive }: ThinkingSegmentProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (!isActive) return;
		const start = Date.now();
		const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
		return () => clearInterval(id);
	}, [isActive]);

	return (
		<Card
			className={cn("w-full cursor-pointer transition-colors border", isActive ? "bg-primary/10 border-primary/30" : "bg-content2/50 border-divider")}
			isPressable={!!text}
			onPress={() => text && setIsExpanded(!isExpanded)}
		>
			<CardBody className="p-3">
				<div className="flex items-center gap-2">
					<Icon icon="solar:brain-bold" className={cn("text-lg", isActive ? "text-primary animate-pulse" : "text-primary/80")} />
					<span className="text-small font-medium">{isActive ? `Thinking ${elapsed}s` : `Thought for ${elapsed || "..."}s`}</span>
					{isActive && <ShimmerBar />}
					{text && <Icon icon="solar:alt-arrow-right-linear" className={cn("text-default-400 ml-auto transition-transform", isExpanded && "rotate-90")} />}
				</div>
				{isExpanded && text && (
					<div className="mt-3 pt-3 border-t border-divider">
						<p className="text-tiny text-default-500 whitespace-pre-wrap max-h-[200px] overflow-auto">{text}</p>
					</div>
				)}
			</CardBody>
		</Card>
	);
}

function ShimmerBar() {
	return (
		<div className="relative w-10 h-1 bg-primary/30 rounded-full overflow-hidden">
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

// Export types for ChatPanel
export type { Message, Segment };
