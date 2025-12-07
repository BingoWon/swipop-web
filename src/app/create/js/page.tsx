"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { useProjectEditor } from "../layout";

export default function JsPage() {
	const { jsContent, setJsContent } = useProjectEditor();

	return (
		<CodeEditor
			language="JavaScript"
			value={jsContent}
			onChange={setJsContent}
			placeholder="// Add your JavaScript here"
		/>
	);
}
