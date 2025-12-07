"use client";

import { EditorState, type Extension } from "@codemirror/state";
import {
	EditorView,
	placeholder as placeholderExt,
} from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useRef } from "react";

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
 * No header - relies on parent tabs to show language
 */
export function CodeEditor({
	language,
	value,
	onChange,
	placeholder,
}: CodeEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	const langKey = language.toLowerCase();

	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

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
					fontFamily:
						"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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
		<div ref={editorRef} className="h-full overflow-auto bg-[#282c34]" />
	);
}
