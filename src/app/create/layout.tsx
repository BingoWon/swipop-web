"use client";

import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createContext, type ReactNode, useContext, useState } from "react";
import type { ChatMessage } from "@/components/ai/MessageCard";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

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
}

const ProjectEditorContext = createContext<ProjectEditorContextType | null>(
	null,
);

/**
 * Hook to access project editor state
 * Must be used within CreateLayout
 */
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
	const [projectTitle, setProjectTitle] = useState("");
	const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
	const [cssContent, setCssContent] = useState(DEFAULT_CSS);
	const [jsContent, setJsContent] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	const addMessage = (message: ChatMessage) => {
		setMessages((prev) => [...prev, message]);
	};

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
			}}
		>
			<SidebarLayout noPadding>
				<div className="flex flex-col h-screen">
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
					<main className="flex-1 overflow-auto">{children}</main>
				</div>
			</SidebarLayout>
		</ProjectEditorContext.Provider>
	);
}
