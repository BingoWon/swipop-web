"use client";

import type { ChangeEvent } from "react";

interface CodeEditorProps {
	/** The code language label (HTML, CSS, JavaScript) */
	language: string;
	/** Current code content */
	value: string;
	/** Callback when content changes */
	onChange: (value: string) => void;
	/** Optional placeholder text */
	placeholder?: string;
}

/**
 * Reusable code editor component for HTML/CSS/JS editing
 * Provides consistent styling and character count display
 */
export function CodeEditor({
	language,
	value,
	onChange,
	placeholder,
}: CodeEditorProps) {
	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className="h-full flex flex-col">
			<header className="px-4 py-2 border-b border-divider bg-content1 flex items-center gap-2">
				<span className="text-small font-medium">{language}</span>
				<span className="text-tiny text-default-400">
					{value.length} characters
				</span>
			</header>
			<textarea
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				className="flex-1 w-full bg-content2 p-4 font-mono text-sm outline-none resize-none"
				spellCheck={false}
			/>
		</div>
	);
}
