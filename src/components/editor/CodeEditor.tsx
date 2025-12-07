"use client";

import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, placeholder as placeholderExt } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useRef, useCallback } from "react";

type Language = "html" | "css" | "javascript" | "HTML" | "CSS" | "JavaScript";

interface CodeEditorProps {
	language: Language;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const languageExtensions: Record<string, () => Extension> = {
	html: html,
	css: css,
	javascript: javascript,
};

/**
 * CodeMirror 6-based code editor with syntax highlighting
 * Styled to match HeroUI dark theme
 */
export function CodeEditor({
	language,
	value,
	onChange,
	placeholder,
}: CodeEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	// Normalize language key
	const langKey = language.toLowerCase();
	const langLabel = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();

	// Stable onChange callback
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// Create editor on mount
	useEffect(() => {
		if (!editorRef.current) return;

		const langExt = languageExtensions[langKey]?.() || [];

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				onChangeRef.current(update.state.doc.toString());
			}
		});

		const extensions: Extension[] = [
			langExt,
			oneDark,
			updateListener,
			EditorView.lineWrapping,
			EditorView.theme({
				"&": {
					height: "100%",
					fontSize: "14px",
				},
				".cm-scroller": {
					fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
					padding: "16px",
				},
				".cm-content": {
					caretColor: "#a855f7",
				},
				"&.cm-focused .cm-cursor": {
					borderLeftColor: "#a855f7",
				},
				"&.cm-focused .cm-selectionBackground, ::selection": {
					backgroundColor: "#a855f740",
				},
			}),
		];

		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}

		const state = EditorState.create({
			doc: value,
			extensions,
		});

		const view = new EditorView({
			state,
			parent: editorRef.current,
		});

		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [langKey, placeholder]);

	// Sync external value changes
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		const currentValue = view.state.doc.toString();
		if (currentValue !== value) {
			view.dispatch({
				changes: {
					from: 0,
					to: currentValue.length,
					insert: value,
				},
			});
		}
	}, [value]);

	return (
		<div className="h-full flex flex-col">
			<header className="px-4 py-2 border-b border-divider bg-content1 flex items-center gap-2">
				<span className="text-small font-medium">{langLabel}</span>
				<span className="text-tiny text-default-400">
					{value.length} characters
				</span>
			</header>
			<div ref={editorRef} className="flex-1 overflow-auto bg-[#282c34]" />
		</div>
	);
}
