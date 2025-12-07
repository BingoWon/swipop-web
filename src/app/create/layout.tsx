"use client";

import { Button, Input, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
	createContext,
	type ReactNode,
	useContext,
	useState,
	type Key,
} from "react";
import type { ChatMessage } from "@/components/ai/MessageCard";
import { SignInPrompt, signInPrompts } from "@/components/auth/SignInPrompt";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useAuth } from "@/lib/contexts/AuthContext";

interface ProjectEditorContextType {
	projectTitle: string;
	setProjectTitle: (title: string) => void;
	htmlContent: string;
	setHtmlContent: (content: string) => void;
	cssContent: string;
	setCssContent: (content: string) => void;
	jsContent: string;
	setJsContent: (content: string) => void;
	messages: ChatMessage[];
	addMessage: (message: ChatMessage) => void;
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const ProjectEditorContext = createContext<ProjectEditorContextType | null>(
	null,
);

export function useProjectEditor() {
	const context = useContext(ProjectEditorContext);
	if (!context) {
		throw new Error("useProjectEditor must be used within CreateLayout");
	}
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

export default function CreateLayout({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [projectTitle, setProjectTitle] = useState("");
	const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
	const [cssContent, setCssContent] = useState(DEFAULT_CSS);
	const [jsContent, setJsContent] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [activeTab, setActiveTab] = useState("chat");

	const addMessage = (message: ChatMessage) => {
		setMessages((prev) => [...prev, message]);
	};

	// Show sign-in prompt for unauthenticated users
	if (!user) {
		return (
			<SidebarLayout>
				<SignInPrompt {...signInPrompts.create} />
			</SidebarLayout>
		);
	}



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

	return (
		<ProjectEditorContext.Provider
			value={{
				projectTitle,
				setProjectTitle,
				htmlContent,
				setHtmlContent,
				cssContent,
				setCssContent,
				jsContent,
				setJsContent,
				messages,
				addMessage,
				activeTab,
				setActiveTab,
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
							<Button
								variant="flat"
								size="sm"
								startContent={
									<Icon
										icon="solar:cloud-check-linear"
										className="text-success"
									/>
								}
							>
								Saved
							</Button>
							<Button
								color="primary"
								size="sm"
								startContent={<Icon icon="solar:upload-linear" />}
							>
								Publish
							</Button>
						</div>
					</header>

					{/* Main Content - Left Preview + Right Editor */}
					<main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
						{/* Left: Preview - matching project detail page style */}
						<div className="flex-1 bg-black rounded-large overflow-hidden min-h-[300px] lg:min-h-0">
							<iframe
								srcDoc={previewSrcDoc}
								sandbox="allow-scripts"
								className="w-full h-full border-0"
								title="Preview"
							/>
						</div>

						{/* Right: Tabbed Editor */}
						<div className="flex-1 border border-divider rounded-large bg-content1 overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
							<Tabs
								selectedKey={activeTab}
								onSelectionChange={(key: Key) => setActiveTab(key as string)}
								classNames={{
									tabList: "px-4 pt-2",
									panel: "flex-1 overflow-hidden p-0",
								}}
								className="flex-1 flex flex-col"
							>
								<Tab
									key="chat"
									title={
										<div className="flex items-center gap-1.5">
											<Icon icon="solar:magic-stick-3-bold" />
											<span>Chat</span>
										</div>
									}
								/>
								<Tab
									key="html"
									title={
										<div className="flex items-center gap-1.5">
											<Icon icon="solar:code-bold" />
											<span>HTML</span>
										</div>
									}
								/>
								<Tab
									key="css"
									title={
										<div className="flex items-center gap-1.5">
											<Icon icon="solar:pallete-2-bold" />
											<span>CSS</span>
										</div>
									}
								/>
								<Tab
									key="js"
									title={
										<div className="flex items-center gap-1.5">
											<Icon icon="solar:programming-bold" />
											<span>JS</span>
										</div>
									}
								/>
							</Tabs>
							<div className="flex-1 overflow-hidden">{children}</div>
						</div>
					</main>
				</div>
			</SidebarLayout>
		</ProjectEditorContext.Provider>
	);
}
