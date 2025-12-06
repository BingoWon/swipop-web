"use client";

import { useCreate } from "../layout";

export default function CssPage() {
	const { cssContent, setCssContent } = useCreate();

	return (
		<div className="h-full flex flex-col">
			<div className="px-4 py-2 border-b border-divider bg-content1 flex items-center gap-2">
				<span className="text-small font-medium">CSS</span>
				<span className="text-tiny text-default-400">
					{cssContent.length} characters
				</span>
			</div>
			<textarea
				value={cssContent}
				onChange={(e) => setCssContent(e.target.value)}
				className="flex-1 w-full bg-content2 p-4 font-mono text-sm outline-none resize-none"
				spellCheck={false}
			/>
		</div>
	);
}
