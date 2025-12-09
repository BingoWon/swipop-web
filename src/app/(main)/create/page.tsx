"use client";

import { ChatPanel } from "@/components/create/ChatPanel";
import { OptionsPanel } from "@/components/create/OptionsPanel";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useProjectEditor } from "./layout";

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
		case "options":
			return <OptionsPanel />;
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
		default:
			return <ChatPanel />;
	}
}
