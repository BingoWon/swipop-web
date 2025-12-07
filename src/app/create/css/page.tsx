"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { useProjectEditor } from "../layout";

export default function CssPage() {
	const { cssContent, setCssContent } = useProjectEditor();

	return (
		<CodeEditor language="CSS" value={cssContent} onChange={setCssContent} />
	);
}
