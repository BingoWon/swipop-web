"use client";

import { Button, ScrollShadow, Textarea, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import {
	type ChatMessage,
	MessageCard,
	TypingIndicator,
} from "@/components/ai/MessageCard";
import { useProjectEditor } from "../layout";

const IDEA_SUGGESTIONS = [
	"Create a neon button with glow effect",
	"Build an animated gradient background",
	"Design a minimal loading spinner",
	"Make a 3D card hover effect",
];

export default function ChatPage() {
	const { messages, addMessage, setHtmlContent, setCssContent, setJsContent } =
		useProjectEditor();
	const [prompt, setPrompt] = React.useState("");
	const [isGenerating, setIsGenerating] = React.useState(false);
	const scrollRef = React.useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when messages change
	React.useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, []);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!prompt.trim() || isGenerating) return;

		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: prompt,
			timestamp: new Date(),
		};
		addMessage(userMessage);
		setPrompt("");
		setIsGenerating(true);

		// TODO: Replace with actual AI API call
		setTimeout(() => {
			const assistantMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: `I'll help you create that! Here's a ${prompt.toLowerCase()} effect:\n\nI've generated the HTML, CSS, and JavaScript code for you. Check the Preview tab to see the result, or edit the code in the HTML, CSS, and JavaScript tabs.`,
				timestamp: new Date(),
			};
			addMessage(assistantMessage);

			// Example generated code
			setHtmlContent(`<div class="effect-container">
  <button class="neon-button">Hover Me</button>
</div>`);
			setCssContent(`.effect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1a1a2e;
}

.neon-button {
  font-size: 1.5rem;
  padding: 1rem 2rem;
  color: #fff;
  background: transparent;
  border: 2px solid #a855f7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7;
}

.neon-button:hover {
  background: #a855f7;
  box-shadow: 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #a855f7;
}`);
			setJsContent("");
			setIsGenerating(false);
		}, 1500);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Messages */}
			<ScrollShadow
				ref={scrollRef}
				className="flex-1 p-4 space-y-4 overflow-auto"
			>
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<Icon
							icon="solar:magic-stick-3-bold"
							className="text-6xl text-primary mb-4"
						/>
						<h2 className="text-xl font-semibold mb-2">Create with AI</h2>
						<p className="text-default-500 max-w-md">
							Describe what you want to build and I'll generate the HTML, CSS,
							and JavaScript for you.
						</p>
					</div>
				) : (
					messages.map((msg) => <MessageCard key={msg.id} message={msg} />)
				)}
				{isGenerating && <TypingIndicator />}
			</ScrollShadow>

			{/* Input Area */}
			<div className="border-t border-divider p-4 space-y-3">
				{/* Idea Suggestions */}
				<ScrollShadow
					hideScrollBar
					orientation="horizontal"
					className="flex gap-2"
				>
					{IDEA_SUGGESTIONS.map((idea) => (
						<Button
							key={idea}
							variant="flat"
							onPress={() => setPrompt(idea)}
							className="shrink-0"
						>
							{idea}
						</Button>
					))}
				</ScrollShadow>

				{/* Prompt Form */}
				<form
					onSubmit={handleSubmit}
					className="rounded-medium bg-default-100 hover:bg-default-200/70 transition-colors"
				>
					<Textarea
						value={prompt}
						onValueChange={setPrompt}
						placeholder="Describe what you want to create..."
						minRows={3}
						variant="flat"
						radius="lg"
						classNames={{
							inputWrapper: "bg-transparent shadow-none",
							input: "py-0 text-medium",
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit();
							}
						}}
					/>
					<div className="flex items-center justify-between px-4 pb-3">
						<Button
							size="sm"
							variant="flat"
							startContent={
								<Icon icon="solar:gallery-bold" className="text-default-500" />
							}
						>
							Templates
						</Button>
						<div className="flex items-center gap-2">
							<span className="text-tiny text-default-400">
								{prompt.length}/2000
							</span>
							<Tooltip content="Send">
								<Button
									isIconOnly
									color={prompt.trim() ? "primary" : "default"}
									isDisabled={!prompt.trim() || isGenerating}
									radius="lg"
									size="sm"
									type="submit"
								>
									<Icon icon="solar:arrow-up-linear" className="text-lg" />
								</Button>
							</Tooltip>
						</div>
					</div>
				</form>
				<p className="text-tiny text-default-400 text-center">
					Swipop AI can make mistakes. Review the generated code before
					publishing.
				</p>
			</div>
		</div>
	);
}
