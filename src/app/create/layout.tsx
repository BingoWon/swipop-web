"use client";

import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createContext, type ReactNode, useContext, useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

interface CreateContextType {
	projectTitle: string;
	setProjectTitle: (title: string) => void;
	htmlContent: string;
	setHtmlContent: (content: string) => void;
	cssContent: string;
	setCssContent: (content: string) => void;
	jsContent: string;
	setJsContent: (content: string) => void;
	messages: Message[];
	addMessage: (message: Message) => void;
}

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

const CreateContext = createContext<CreateContextType | null>(null);

export function useCreate() {
	const context = useContext(CreateContext);
	if (!context) throw new Error("useCreate must be used within CreateLayout");
	return context;
}

export default function CreateLayout({ children }: { children: ReactNode }) {
	const [projectTitle, setProjectTitle] = useState("");
	const [htmlContent, setHtmlContent] = useState(`<div class="container">
  <h1>Hello World</h1>
</div>`);
	const [cssContent, setCssContent] = useState(`.container {
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
}`);
	const [jsContent, setJsContent] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);

	const addMessage = (message: Message) => {
		setMessages((prev) => [...prev, message]);
	};

	return (
		<CreateContext.Provider
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

					{/* Main Content */}
					<main className="flex-1 overflow-auto">{children}</main>
				</div>
			</SidebarLayout>
		</CreateContext.Provider>
	);
}
