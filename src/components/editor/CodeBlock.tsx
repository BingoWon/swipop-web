"use client";

import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

type Language = "html" | "css" | "javascript";

interface CodeBlockProps {
    code: string;
    language: Language;
}

const languageExtensions: Record<Language, () => Extension> = {
    html,
    css,
    javascript,
};

/**
 * Read-only code block with syntax highlighting and copy button
 * Uses CodeMirror 6 for consistent highlighting with editor
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [copied, setCopied] = useState(false);

    // Create read-only editor on mount
    useEffect(() => {
        if (!editorRef.current) return;

        const langExt = languageExtensions[language]?.() || [];

        const extensions: Extension[] = [
            langExt,
            oneDark,
            EditorView.editable.of(false),
            EditorState.readOnly.of(true),
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
                ".cm-gutters": {
                    display: "none",
                },
            }),
        ];

        const state = EditorState.create({
            doc: code,
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
    }, [code, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative h-full">
            <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="absolute top-3 right-3 z-10 bg-default-100/50 backdrop-blur-sm"
                onPress={handleCopy}
            >
                <Icon
                    icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"}
                    className={`text-lg ${copied ? "text-success" : "text-default-500"}`}
                />
            </Button>
            <div ref={editorRef} className="h-full overflow-auto bg-[#282c34]" />
        </div>
    );
}
