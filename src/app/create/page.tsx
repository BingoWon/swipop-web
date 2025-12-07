"use client";

import { useProjectEditor } from "./layout";
import { ChatPanel } from "@/components/create/ChatPanel";
import { CodeEditor } from "@/components/editor/CodeEditor";

/**
 * Main create page - renders content based on active tab
 * Layout handles the preview and tab switching
 */
export default function CreatePage() {
	const {
		activeTab,
		htmlContent,
		setHtmlContent,
		cssContent,
		setCssContent,
		jsContent,
		setJsContent,
	} = useProjectEditor();

	switch (activeTab) {
		case "html":
			return (
				<CodeEditor
					language="html"
					value={htmlContent}
					onChange={setHtmlContent}
				/>
			);
		case "css":
			return (
				<CodeEditor
					language="css"
					value={cssContent}
					onChange={setCssContent}
				/>
			);
		case "js":
			return (
				<CodeEditor
					language="javascript"
					value={jsContent}
					onChange={setJsContent}
					placeholder="// Add your JavaScript here"
				/>
			);
		case "chat":
		default:
			return <ChatPanel />;
	}
}
