"use client";

import { Avatar, Card, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { Message, Segment } from "@/app/(main)/create/layout";

// Constants
const AI_AVATAR_URL =
	"https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png";

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
			{!isUser && (
				<Avatar
					src={AI_AVATAR_URL}
					showFallback
					name="AI"
					size="sm"
					className="shrink-0"
				/>
			)}

			<div
				className={cn(
					"flex flex-col gap-2",
					isUser ? "items-end" : "items-start",
				)}
			>
				{message.segments.map((segment, i) =>
					renderSegment(segment, i, isUser),
				)}
			</div>

			{isUser && (
				<Avatar
					showFallback
					name="U"
					size="sm"
					className="shrink-0 bg-primary"
				/>
			)}
		</div>
	);
}

function renderSegment(segment: Segment, index: number, isUser: boolean) {
	switch (segment.type) {
		case "text":
			if (!segment.content) return null;
			return (
				<div
					key={index}
					className={cn(
						"rounded-medium px-4 py-3",
						isUser ? "bg-primary text-primary-foreground" : "bg-content2",
					)}
				>
					{isUser ? (
						<p className="text-small whitespace-pre-wrap">{segment.content}</p>
					) : (
						<RichTextContent content={segment.content} />
					)}
				</div>
			);

		case "thinking":
			return (
				<ThinkingSegment
					key={index}
					text={segment.content}
					isActive={segment.isActive}
					startTime={segment.startTime}
				/>
			);

		case "tool_call":
			return <ToolCallSegment key={segment.id} segment={segment} />;

		default:
			return null;
	}
}

// ============================================================================
// RichTextContent - Markdown rendering matching iOS RichMessageContent
// ============================================================================

interface ContentBlock {
	type: "text" | "code";
	content: string;
	language?: string;
}

function parseContentBlocks(content: string): ContentBlock[] {
	const blocks: ContentBlock[] = [];
	const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
	let lastEnd = 0;

	for (const match of content.matchAll(codeBlockRegex)) {
		// Text before code block
		if (match.index > lastEnd) {
			const text = content.slice(lastEnd, match.index).trim();
			if (text) blocks.push({ type: "text", content: text });
		}
		// Code block
		const code = match[2].trim();
		if (code)
			blocks.push({
				type: "code",
				content: code,
				language: match[1] || undefined,
			});
		lastEnd = match.index + match[0].length;
	}

	// Remaining text
	if (lastEnd < content.length) {
		const text = content.slice(lastEnd).trim();
		if (text) blocks.push({ type: "text", content: text });
	}

	// If no blocks, return whole content as text
	if (blocks.length === 0) blocks.push({ type: "text", content });

	return blocks;
}

function RichTextContent({ content }: { content: string }) {
	const blocks = useMemo(() => parseContentBlocks(content), [content]);

	return (
		<div className="space-y-2 text-left">
			{blocks.map((block, i) =>
				block.type === "code" ? (
					<CodeBlock key={i} code={block.content} language={block.language} />
				) : (
					<MarkdownText key={i} content={block.content} />
				),
			)}
		</div>
	);
}

function MarkdownText({ content }: { content: string }) {
	// Simple markdown: **bold**, *italic*, `code`, [link](url)
	const rendered = useMemo(() => {
		const parts: React.ReactNode[] = [];
		// Regex for: **bold**, *italic*, `code`
		const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
		let lastIndex = 0;
		let keyIdx = 0;

		for (const match of content.matchAll(regex)) {
			// Add text before match
			if (match.index > lastIndex) {
				parts.push(content.slice(lastIndex, match.index));
			}
			// Determine type
			if (match[2]) {
				// **bold**
				parts.push(
					<strong key={keyIdx++} className="font-semibold">
						{match[2]}
					</strong>,
				);
			} else if (match[3]) {
				// *italic*
				parts.push(<em key={keyIdx++}>{match[3]}</em>);
			} else if (match[4]) {
				// `code`
				parts.push(
					<code
						key={keyIdx++}
						className="px-1 py-0.5 rounded bg-default-200 font-mono text-[0.85em]"
					>
						{match[4]}
					</code>,
				);
			}
			lastIndex = match.index + match[0].length;
		}
		// Add remaining text
		if (lastIndex < content.length) {
			parts.push(content.slice(lastIndex));
		}
		return parts.length > 0 ? parts : content;
	}, [content]);

	return <p className="text-small whitespace-pre-wrap">{rendered}</p>;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="rounded-lg overflow-hidden border border-divider bg-content2/50">
			{language && (
				<div className="flex items-center justify-between px-3 py-1.5 bg-content2 border-b border-divider">
					<span className="text-tiny font-mono text-default-500 uppercase">
						{language}
					</span>
					<button
						type="button"
						onClick={handleCopy}
						className="text-default-400 hover:text-foreground transition-colors"
					>
						<Icon
							icon={copied ? "solar:check-circle-bold" : "solar:copy-bold"}
							className="text-sm"
						/>
					</button>
				</div>
			)}
			<pre className="px-3 py-2 text-tiny font-mono overflow-x-auto whitespace-pre-wrap text-foreground/90">
				{code}
			</pre>
		</div>
	);
}

// ============================================================================
// ToolCallSegment
// ============================================================================

interface ToolCallSegmentProps {
	segment: Extract<Segment, { type: "tool_call" }>;
}

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
				isComplete
					? "border-success/30 bg-content2"
					: "border-warning/40 bg-content2",
			)}
			isPressable={hasContent}
			onPress={() => hasContent && setIsExpanded(!isExpanded)}
		>
			<div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
				<Icon
					icon={icon}
					className={cn(
						"text-base shrink-0",
						isStreaming ? "text-warning" : "text-success",
					)}
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
						className={cn(
							"text-default-400 ml-auto shrink-0 transition-transform",
							isExpanded && "rotate-90",
						)}
					/>
				)}
			</div>

			{isExpanded && hasContent && (
				<>
					<div className="border-t border-divider px-3 py-2 text-left">
						<p className="text-tiny text-default-500 mb-1">
							{isStreaming ? "Arguments (streaming...)" : "Arguments"}
						</p>
						<pre className="text-tiny font-mono text-foreground/80 whitespace-pre-wrap max-h-[200px] overflow-auto">
							{args}
						</pre>
					</div>
					{result && (
						<div className="border-t border-divider px-3 py-2 text-left">
							<p className="text-tiny text-default-500 mb-1">Result</p>
							<pre className="text-tiny font-mono text-success whitespace-pre-wrap">
								{result}
							</pre>
						</div>
					)}
				</>
			)}
		</Card>
	);
}

// ============================================================================
// ThinkingSegment
// ============================================================================

interface ThinkingSegmentProps {
	text: string;
	isActive: boolean;
	startTime: number;
}

function ThinkingSegment({ text, isActive, startTime }: ThinkingSegmentProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [elapsed, setElapsed] = useState(() =>
		startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0,
	);

	useEffect(() => {
		if (!isActive || startTime === 0) return;
		const update = () =>
			setElapsed(Math.floor((Date.now() - startTime) / 1000));
		update();
		const id = setInterval(update, 1000);
		return () => clearInterval(id);
	}, [isActive, startTime]);

	return (
		<Card
			className={cn(
				"cursor-pointer transition-colors border",
				isActive
					? "bg-primary/10 border-primary/30"
					: "bg-content2/50 border-divider",
			)}
			isPressable={!!text}
			onPress={() => text && setIsExpanded(!isExpanded)}
		>
			<div className="flex items-center gap-2 px-3 py-2.5">
				<Icon
					icon="solar:brain-bold"
					className={cn(
						"text-base shrink-0",
						isActive ? "text-primary animate-pulse" : "text-primary/80",
					)}
				/>
				<span className="text-small font-medium whitespace-nowrap">
					{isActive
						? `Thinking ${elapsed}s`
						: startTime > 0
							? `Thought for ${elapsed}s`
							: "Thought"}
				</span>
				{isActive && <ShimmerBar />}
				{text && (
					<Icon
						icon="solar:alt-arrow-right-linear"
						className={cn(
							"text-default-400 ml-auto shrink-0 transition-transform",
							isExpanded && "rotate-90",
						)}
					/>
				)}
			</div>
			{isExpanded && text && (
				<div className="border-t border-divider px-3 py-2 text-left">
					<p className="text-tiny text-default-500 whitespace-pre-wrap max-h-[200px] overflow-auto">
						{text}
					</p>
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
						<span
							key={delay}
							className="w-2 h-2 bg-primary rounded-full animate-bounce"
							style={{ animationDelay: `${delay}ms` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
