"use client";

import { Button, Input, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createContext, type Key, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SignInPrompt, signInPrompts } from "@/components/auth/SignInPrompt";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageLoading } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

// AI Model types matching iOS
export type AIModel = "deepseek-chat" | "deepseek-reasoner";

export const AI_MODELS = {
	chat: { id: "deepseek-chat" as const, name: "DeepSeek V3.2", description: "Fast responses, great for simple tasks", supportsThinking: false },
	reasoner: { id: "deepseek-reasoner" as const, name: "DeepSeek V3.2 Thinking", description: "Deep thinking, best for complex creations", supportsThinking: true },
};

// History entry type for API calls
export interface HistoryEntry {
	role: "system" | "user" | "assistant" | "tool";
	content?: string | null;
	reasoning_content?: string;
	tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
	tool_call_id?: string;
}

// Message types for UI display (matches iOS ChatMessage)
export type Segment =
	| { type: "text"; content: string }
	| { type: "thinking"; content: string; isActive: boolean; duration?: number }
	| { type: "tool_call"; id: string; name: string; arguments: string; result?: string; isStreaming: boolean };

export interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	segments: Segment[];
	isStreaming?: boolean;
}

// Context interface matching iOS ProjectEditorViewModel + ChatViewModel
interface ProjectEditorContextType {
	// Identity
	projectId: string | null;
	isNew: boolean;
	// Content
	projectTitle: string;
	setProjectTitle: (title: string) => void;
	description: string;
	setDescription: (desc: string) => void;
	tags: string[];
	setTags: (tags: string[]) => void;
	htmlContent: string;
	setHtmlContent: (content: string) => void;
	cssContent: string;
	setCssContent: (content: string) => void;
	jsContent: string;
	setJsContent: (content: string) => void;
	// State
	isPublished: boolean;
	setIsPublished: (val: boolean) => void;
	isDirty: boolean;
	isSaving: boolean;
	saveError: string | null;
	lastSaved: Date | null;
	// AI Model
	selectedModel: AIModel;
	setSelectedModel: (model: AIModel) => void;
	// Token stats
	promptTokens: number;
	setPromptTokens: (tokens: number) => void;
	// Chat messages (UI display)
	messages: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
	// Chat history (for API calls)
	historyRef: React.RefObject<HistoryEntry[]>;
	// Actions
	save: () => Promise<void>;
	reset: () => void;
	load: (project: Project) => void;
	// Tab
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const ProjectEditorContext = createContext<ProjectEditorContextType | null>(null);

export function useProjectEditor() {
	const context = useContext(ProjectEditorContext);
	if (!context) throw new Error("useProjectEditor must be used within CreateLayout");
	return context;
}

const DEFAULT_HTML = `<div class="container">
  <h1>Hello World</h1>
</div>`;

const DEFAULT_CSS = `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  font-size: 3rem;
  font-family: sans-serif;
}`;

const SYSTEM_PROMPT = `You are a creative AI assistant in Swipop, a social app for sharing HTML/CSS/JS creative projects.
Help users create interactive, visually appealing web components.

## Current Project State
The current state of HTML, CSS, JavaScript, and metadata is provided with each message.
You always have access to the latest content - no need to read before editing.

## Available Tools

### Writing (full replacement)
- write_html, write_css, write_javascript: Replace entire file content
  - Use for new projects or major rewrites

### Replacing (targeted edits, preferred for existing code)
- replace_in_html, replace_in_css, replace_in_javascript: Find and replace
  - The 'search' text must match exactly and be unique
  - Use for small, localized changes

### Metadata
- update_metadata: Update title, description, and/or tags (partial updates supported)

## Guidelines
1. Prefer replace_in_* for small changes to existing code
2. Use write_* for new projects or major rewrites
3. Make it visually impressive with modern CSS
4. Add smooth animations and consider mobile responsiveness`;

export default function CreateLayout({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();

	// Identity
	const [projectId, setProjectId] = useState<string | null>(null);

	// Content
	const [projectTitle, setProjectTitleRaw] = useState("");
	const [description, setDescriptionRaw] = useState("");
	const [tags, setTagsRaw] = useState<string[]>([]);
	const [htmlContent, setHtmlContentRaw] = useState(DEFAULT_HTML);
	const [cssContent, setCssContentRaw] = useState(DEFAULT_CSS);
	const [jsContent, setJsContentRaw] = useState("");

	// State
	const [isPublished, setIsPublishedRaw] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [selectedModel, setSelectedModel] = useState<AIModel>("deepseek-chat");
	const [promptTokens, setPromptTokens] = useState(0);
	const [activeTab, setActiveTab] = useState("chat");

	// Chat messages for UI display
	const [messages, setMessages] = useState<Message[]>([]);

	// Chat history ref (for API calls)
	const historyRef = useRef<HistoryEntry[]>([{ role: "system", content: SYSTEM_PROMPT }]);

	// Dirty-tracking setters
	const markDirty = useCallback(() => setIsDirty(true), []);
	const setProjectTitle = useCallback((v: string) => { setProjectTitleRaw(v); markDirty(); }, [markDirty]);
	const setDescription = useCallback((v: string) => { setDescriptionRaw(v); markDirty(); }, [markDirty]);
	const setTags = useCallback((v: string[]) => { setTagsRaw(v); markDirty(); }, [markDirty]);
	const setHtmlContent = useCallback((v: string) => { setHtmlContentRaw(v); markDirty(); }, [markDirty]);
	const setCssContent = useCallback((v: string) => { setCssContentRaw(v); markDirty(); }, [markDirty]);
	const setJsContent = useCallback((v: string) => { setJsContentRaw(v); markDirty(); }, [markDirty]);
	const setIsPublished = useCallback((v: boolean) => { setIsPublishedRaw(v); markDirty(); }, [markDirty]);

	// Check if has meaningful content (matches iOS hasContent)
	const hasContent = htmlContent !== DEFAULT_HTML || cssContent !== DEFAULT_CSS || jsContent !== "" || projectTitle !== "";

	// Load project (matches iOS ProjectEditorViewModel.load)
	const load = useCallback((project: Project) => {
		setProjectId(project.id);
		setProjectTitleRaw(project.title);
		setDescriptionRaw(project.description || "");
		setTagsRaw(project.tags || []);
		setHtmlContentRaw(project.html_content || "");
		setCssContentRaw(project.css_content || "");
		setJsContentRaw(project.js_content || "");
		setIsPublishedRaw(project.is_published);
		setIsDirty(false);
		setSaveError(null);

		// Load chat history (cast from generic type)
		const chatHistory = project.chat_messages as HistoryEntry[] | null;
		if (chatHistory && chatHistory.length > 0) {
			historyRef.current = chatHistory;
			// Reconstruct UI messages from history (matches iOS loadFromProjectEditor)
			const uiMessages: Message[] = [];
			let currentAssistantMsg: Message | null = null;

			for (const entry of chatHistory) {
				if (entry.role === "system") continue;

				if (entry.role === "user" && entry.content) {
					if (currentAssistantMsg) {
						uiMessages.push(currentAssistantMsg);
						currentAssistantMsg = null;
					}
					// Extract user request from context-injected message
					const content = entry.content;
					const match = content.match(/\[User Request\]\n([\s\S]*)/);
					const displayText = match ? match[1] : content;
					uiMessages.push({ id: crypto.randomUUID(), role: "user", content: displayText, segments: [{ type: "text", content: displayText }] });
				}

				if (entry.role === "assistant") {
					if (!currentAssistantMsg) {
						currentAssistantMsg = { id: crypto.randomUUID(), role: "assistant", content: "", segments: [] };
					}
					if (entry.reasoning_content) {
						currentAssistantMsg.segments.push({ type: "thinking", content: entry.reasoning_content, isActive: false });
					}
					if (entry.tool_calls) {
						for (const tc of entry.tool_calls) {
							currentAssistantMsg.segments.push({ type: "tool_call", id: tc.id, name: tc.function.name, arguments: tc.function.arguments, isStreaming: false });
						}
					}
					if (entry.content) {
						currentAssistantMsg.content = entry.content;
						currentAssistantMsg.segments.push({ type: "text", content: entry.content });
					}
				}
			}
			if (currentAssistantMsg) uiMessages.push(currentAssistantMsg);
			setMessages(uiMessages);
		} else {
			historyRef.current = [{ role: "system", content: SYSTEM_PROMPT }];
			setMessages([]);
		}
	}, []);

	// Save to Supabase
	const save = useCallback(async () => {
		if (!user || isSaving) return;
		setIsSaving(true);
		setSaveError(null);

		try {
			const supabase = createClient();
			const projectData = {
				user_id: user.id,
				title: projectTitle || "Untitled",
				description: description || null,
				tags: tags.length > 0 ? tags : null,
				html_content: htmlContent,
				css_content: cssContent,
				js_content: jsContent,
				is_published: isPublished,
				chat_messages: historyRef.current,
			};

			if (projectId) {
				const { error } = await supabase.from("projects").update(projectData).eq("id", projectId);
				if (error) throw error;
			} else {
				const { data, error } = await supabase.from("projects").insert(projectData).select("id").single();
				if (error) throw error;
				if (data) setProjectId(data.id);
			}

			setIsDirty(false);
			setLastSaved(new Date());
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Save failed");
		} finally {
			setIsSaving(false);
		}
	}, [user, isSaving, projectId, projectTitle, description, tags, htmlContent, cssContent, jsContent, isPublished]);

	// Reset (matches iOS ProjectEditorViewModel.reset)
	const reset = useCallback(() => {
		setProjectId(null);
		setProjectTitleRaw("");
		setDescriptionRaw("");
		setTagsRaw([]);
		setHtmlContentRaw(DEFAULT_HTML);
		setCssContentRaw(DEFAULT_CSS);
		setJsContentRaw("");
		setIsPublishedRaw(false);
		setIsDirty(false);
		setSaveError(null);
		setLastSaved(null);
		setPromptTokens(0);
		setMessages([]);
		historyRef.current = [{ role: "system", content: SYSTEM_PROMPT }];
	}, []);

	// Real-time auto-save with debounce (2 seconds)
	const AUTO_SAVE_DELAY = 2000;

	useEffect(() => {
		// Skip if not ready to save
		if (!user || !hasContent || !isDirty || isSaving) return;

		const timer = setTimeout(() => {
			save();
		}, AUTO_SAVE_DELAY);

		return () => clearTimeout(timer);
	}, [user, hasContent, isDirty, isSaving, save]);

	// Safety: warn before unload if still dirty
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasContent && isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasContent, isDirty]);

	if (loading) return <PageLoading />;
	if (!user) return <SidebarLayout><SignInPrompt {...signInPrompts.create} /></SidebarLayout>;

	const previewSrcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${cssContent}</style>
</head>
<body style="margin:0">
  ${htmlContent}
  <script>${jsContent}</script>
</body>
</html>`;

	const isNew = projectId === null;

	return (
		<ProjectEditorContext.Provider
			value={{
				projectId, isNew, projectTitle, setProjectTitle, description, setDescription,
				tags, setTags, htmlContent, setHtmlContent, cssContent, setCssContent,
				jsContent, setJsContent, isPublished, setIsPublished, isDirty, isSaving,
				saveError, lastSaved, selectedModel, setSelectedModel, promptTokens, setPromptTokens,
				messages, setMessages, historyRef, save, reset, load, activeTab, setActiveTab,
			}}
		>
			<SidebarLayout noPadding>
				<div className="flex flex-col h-screen">
					{/* Header */}
					<header className="flex items-center justify-between px-4 py-3 border-b border-divider shrink-0">
						<Input
							placeholder="Untitled Project"
							value={projectTitle}
							onValueChange={setProjectTitle}
							variant="bordered"
							size="sm"
							className="max-w-xs"
							classNames={{ input: "font-medium" }}
						/>
						<div className="flex gap-2">
							{saveError && <span className="text-tiny text-danger">{saveError}</span>}
							<Button
								variant="flat"
								size="sm"
								isLoading={isSaving}
								isDisabled={!isDirty && !isSaving}
								onPress={save}
								startContent={!isSaving && <Icon icon={isDirty ? "solar:cloud-upload-linear" : "solar:cloud-check-linear"} className={isDirty ? "text-warning" : "text-success"} />}
							>
								{isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
							</Button>
							<Button
								color={isPublished ? "success" : "default"}
								variant={isPublished ? "solid" : "flat"}
								size="sm"
								onPress={() => setIsPublished(!isPublished)}
								startContent={<Icon icon={isPublished ? "solar:eye-bold" : "solar:eye-closed-linear"} />}
							>
								{isPublished ? "Published" : "Draft"}
							</Button>
						</div>
					</header>

					{/* Main Content */}
					<main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
						{/* Left: Preview */}
						<div className="flex-1 bg-black rounded-large overflow-hidden min-h-[300px] lg:min-h-0">
							<iframe srcDoc={previewSrcDoc} sandbox="allow-scripts" className="w-full h-full border-0" title="Preview" />
						</div>

						{/* Right: Tabbed Panel */}
						<div className="flex-1 border border-divider rounded-large bg-content1 overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
							<Tabs
								fullWidth
								selectedKey={activeTab}
								onSelectionChange={(key: Key) => setActiveTab(key as string)}
								classNames={{ base: "border-b border-divider", tabList: "p-0 gap-0", tab: "h-10", panel: "hidden" }}
							>
								<Tab key="chat" title={<TabTitle icon="solar:magic-stick-3-bold" label="Chat" />} />
								<Tab key="options" title={<TabTitle icon="solar:settings-bold" label="Options" />} />
								<Tab key="html" title={<TabTitle icon="solar:code-bold" label="HTML" />} />
								<Tab key="css" title={<TabTitle icon="solar:pallete-2-bold" label="CSS" />} />
								<Tab key="js" title={<TabTitle icon="solar:programming-bold" label="JS" />} />
							</Tabs>
							<div className="flex-1 overflow-hidden">{children}</div>
						</div>
					</main>
				</div>
			</SidebarLayout>
		</ProjectEditorContext.Provider>
	);
}

function TabTitle({ icon, label }: { icon: string; label: string }) {
	return (
		<div className="flex items-center gap-1.5">
			<Icon icon={icon} />
			<span>{label}</span>
		</div>
	);
}
