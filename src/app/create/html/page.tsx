"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { useProjectEditor } from "../layout";

export default function HtmlPage() {
	const { htmlContent, setHtmlContent } = useProjectEditor();

	return (
		<CodeEditor language="HTML" value={htmlContent} onChange={setHtmlContent} />
	);
}
