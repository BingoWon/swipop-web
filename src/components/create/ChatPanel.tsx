"use client";

import { Button, ScrollShadow, Textarea, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCard, TypingIndicator } from "@/components/ai/MessageCard";
import { useProjectEditor, AI_MODELS, type HistoryEntry, type Message, type Segment } from "@/app/(main)/create/layout";
import { streamChat, type StreamEvent } from "@/lib/ai/service";

const IDEA_SUGGESTIONS = [
    "Create a neon button with glow effect",
    "Build an animated gradient background",
    "Design a minimal loading spinner",
    "Make a 3D card hover effect",
];

/**
 * ChatPanel - Complete implementation matching iOS ChatViewModel
 * Supports multi-turn tool calls, model selection, and history management
 * Messages state lifted to Context so chat persists across tab switches
 */
export function ChatPanel() {
    const {
        projectTitle, description, tags, htmlContent, cssContent, jsContent,
        setHtmlContent, setCssContent, setJsContent, setProjectTitle, setDescription, setTags,
        selectedModel, historyRef, setPromptTokens,
        messages, setMessages,
    } = useProjectEditor();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Streaming state refs (matches iOS)
    const currentMsgIndexRef = useRef(0);
    const currentThinkingIndexRef = useRef<number | null>(null);
    const accumulatedReasoningRef = useRef("");
    const toolCallsRef = useRef<Record<number, { id: string; name: string; args: string; segmentIndex: number }>>({});
    const currentTextSegmentRef = useRef(-1);

    // Check if model supports thinking
    const supportsThinking = AI_MODELS[selectedModel === "deepseek-reasoner" ? "reasoner" : "chat"].supportsThinking;

    // Build context message (matches iOS buildUserMessageWithContext)
    const buildContext = useCallback(
        (userText: string) => {
            const format = (name: string, content: string, lang: string) =>
                content ? `[${name}] (${content.split("\n").length} lines)\n\`\`\`${lang}\n${content}\n\`\`\`` : `[${name}] (empty)`;

            return [
                "[Current Project State]",
                `Title: ${projectTitle || "(empty)"}`,
                `Description: ${description || "(empty)"}`,
                `Tags: ${tags.length > 0 ? tags.join(", ") : "(none)"}`,
                "",
                format("HTML", htmlContent, "html"),
                "",
                format("CSS", cssContent, "css"),
                "",
                format("JavaScript", jsContent, "javascript"),
                "",
                "[User Request]",
                userText,
            ].join("\n");
        },
        [projectTitle, description, tags, htmlContent, cssContent, jsContent],
    );

    // Execute tool (matches iOS executeToolCall)
    const executeTool = useCallback(
        (name: string, argsJson: string): string => {
            try {
                const args = JSON.parse(argsJson || "{}");

                if (name === "write_html" && typeof args.content === "string") {
                    setHtmlContent(args.content);
                    return JSON.stringify({ success: true, lines: args.content.split("\n").length });
                }
                if (name === "write_css" && typeof args.content === "string") {
                    setCssContent(args.content);
                    return JSON.stringify({ success: true, lines: args.content.split("\n").length });
                }
                if (name === "write_javascript" && typeof args.content === "string") {
                    setJsContent(args.content);
                    return JSON.stringify({ success: true, lines: args.content.split("\n").length });
                }

                if (name.startsWith("replace_in_")) {
                    const type = name.replace("replace_in_", "") as "html" | "css" | "javascript";
                    const contents = { html: htmlContent, css: cssContent, javascript: jsContent };
                    const setters = { html: setHtmlContent, css: setCssContent, javascript: setJsContent };

                    if (typeof args.search === "string" && typeof args.replace === "string") {
                        const content = contents[type];
                        const count = content.split(args.search).length - 1;
                        if (count === 0) return JSON.stringify({ success: false, error: "Search text not found" });
                        if (count > 1) return JSON.stringify({ success: false, error: `Found ${count} times. Must be unique.` });
                        setters[type](content.replace(args.search, args.replace));
                        return JSON.stringify({ success: true, replaced: 1 });
                    }
                }

                if (name === "update_metadata") {
                    if (typeof args.title === "string") setProjectTitle(args.title);
                    if (typeof args.description === "string") setDescription(args.description);
                    if (Array.isArray(args.tags)) setTags(args.tags);
                    return JSON.stringify({ success: true, action: "metadata_updated" });
                }

                if (name === "summarize_conversation") {
                    return JSON.stringify({ success: true, action: "conversation_summarized" });
                }

                return JSON.stringify({ error: "Unknown tool" });
            } catch (e) {
                return JSON.stringify({ error: e instanceof Error ? e.message : "Parse error" });
            }
        },
        [htmlContent, cssContent, jsContent, setHtmlContent, setCssContent, setJsContent, setProjectTitle, setDescription, setTags],
    );

    // Clear reasoning_content from history (matches iOS clearReasoningFromHistory)
    const clearReasoningFromHistory = useCallback(() => {
        for (const entry of historyRef.current) {
            if (entry.reasoning_content) delete entry.reasoning_content;
        }
    }, [historyRef]);

    // Update assistant message helper
    const updateAssistant = useCallback((updater: (msg: Message) => Message) => {
        setMessages((prev) => prev.map((m, i) => (i === currentMsgIndexRef.current ? updater(m) : m)));
    }, [setMessages]);

    // Finalize current thinking segment (matches iOS finalizeCurrentThinking)
    const finalizeCurrentThinking = useCallback(() => {
        const thinkingIdx = currentThinkingIndexRef.current;
        if (thinkingIdx === null) return;

        updateAssistant((m) => {
            if (thinkingIdx >= m.segments.length) return m;
            const segment = m.segments[thinkingIdx];
            if (segment.type !== "thinking" || !segment.isActive) return m;

            const segments = [...m.segments];
            // Remove empty thinking segments
            if (!segment.content) {
                segments.splice(thinkingIdx, 1);
                // Adjust tool call segment indices
                for (const key of Object.keys(toolCallsRef.current)) {
                    const tc = toolCallsRef.current[Number(key)];
                    if (tc.segmentIndex > thinkingIdx) {
                        tc.segmentIndex -= 1;
                    }
                }
                // Adjust text segment index
                if (currentTextSegmentRef.current > thinkingIdx) {
                    currentTextSegmentRef.current -= 1;
                }
            } else {
                segments[thinkingIdx] = { ...segment, isActive: false };
            }
            return { ...m, segments };
        });
        currentThinkingIndexRef.current = null;
    }, [updateAssistant]);

    // Process stream events
    const processStream = useCallback(async () => {
        let textContent = "";
        let reasoningContent = "";

        await streamChat({
            messages: historyRef.current as Array<{ role: string; content: string }>,
            model: selectedModel,
            signal: abortRef.current?.signal,
            onEvent: (event: StreamEvent) => {
                switch (event.type) {
                    case "reasoning": {
                        reasoningContent += event.content;
                        accumulatedReasoningRef.current += event.content;
                        const thinkingIdx = currentThinkingIndexRef.current;
                        if (thinkingIdx !== null) {
                            updateAssistant((m) => {
                                const segments = [...m.segments];
                                const segment = segments[thinkingIdx];
                                if (segment?.type === "thinking") {
                                    segments[thinkingIdx] = { ...segment, content: reasoningContent };
                                }
                                return { ...m, segments };
                            });
                        }
                        break;
                    }

                    case "content": {
                        // Finalize thinking before adding content
                        finalizeCurrentThinking();
                        textContent += event.content;
                        updateAssistant((m) => {
                            const segments = [...m.segments];
                            if (currentTextSegmentRef.current < 0) {
                                currentTextSegmentRef.current = segments.length;
                                segments.push({ type: "text", content: textContent });
                            } else {
                                segments[currentTextSegmentRef.current] = { type: "text", content: textContent };
                            }
                            return { ...m, content: textContent, segments };
                        });
                        break;
                    }

                    case "tool_call_start": {
                        // Finalize thinking before tool call
                        finalizeCurrentThinking();
                        updateAssistant((m) => {
                            const segmentIndex = m.segments.length;
                            toolCallsRef.current[event.index] = { id: event.id, name: event.name, args: "", segmentIndex };
                            return {
                                ...m,
                                segments: [...m.segments, { type: "tool_call", id: event.id, name: event.name, arguments: "", isStreaming: true }],
                            };
                        });
                        break;
                    }

                    case "tool_call_arguments":
                        if (toolCallsRef.current[event.index]) {
                            toolCallsRef.current[event.index].args += event.delta;
                        }
                        break;

                    case "tool_call_complete": {
                        const tc = toolCallsRef.current[event.index];
                        if (tc) {
                            const result = executeTool(tc.name, event.arguments);
                            updateAssistant((m) => ({
                                ...m,
                                segments: m.segments.map((s) => (s.type === "tool_call" && s.id === tc.id ? { ...s, arguments: event.arguments, result, isStreaming: false } : s)),
                            }));
                            tc.args = event.arguments;
                        }
                        break;
                    }

                    case "usage":
                        setPromptTokens(event.promptTokens);
                        break;

                    case "error":
                        setError(event.message);
                        break;

                    case "done":
                        // Finalize only the current thinking segment
                        finalizeCurrentThinking();
                        updateAssistant((m) => ({ ...m, isStreaming: false }));
                        break;
                }
            },
        });

        return { textContent, reasoningContent };
    }, [historyRef, selectedModel, executeTool, setPromptTokens, updateAssistant, finalizeCurrentThinking]);

    // Finalize tool calls and continue (matches iOS finalizeToolCallsAndContinue)
    const finalizeToolCallsAndContinue = useCallback(async (textContent: string, reasoningContent: string) => {
        const toolCalls = toolCallsRef.current;
        const hasToolCalls = Object.keys(toolCalls).length > 0;

        if (!hasToolCalls) {
            if (textContent) {
                historyRef.current.push({ role: "assistant", content: textContent });
            }
            setIsLoading(false);
            return;
        }

        // Build tool_calls array
        const toolCallsArray = Object.keys(toolCalls)
            .map(Number)
            .sort()
            .map((index) => ({
                id: toolCalls[index].id,
                type: "function" as const,
                function: { name: toolCalls[index].name, arguments: toolCalls[index].args },
            }));

        // Add assistant entry with tool_calls
        const assistantEntry: HistoryEntry = {
            role: "assistant",
            content: null,
            tool_calls: toolCallsArray,
        };
        if (reasoningContent) assistantEntry.reasoning_content = reasoningContent;
        historyRef.current.push(assistantEntry);

        // Add tool results to history
        for (const index of Object.keys(toolCalls).map(Number).sort()) {
            const tc = toolCalls[index];
            const result = executeTool(tc.name, tc.args);
            historyRef.current.push({ role: "tool", tool_call_id: tc.id, content: result });
        }

        // Clear tool calls and text segment ref for next round
        toolCallsRef.current = {};
        accumulatedReasoningRef.current = "";
        currentTextSegmentRef.current = -1;

        // Add new thinking segment if model supports it (matches iOS continueAfterToolCalls)
        if (supportsThinking) {
            updateAssistant((m) => {
                const newThinkingIdx = m.segments.length;
                currentThinkingIndexRef.current = newThinkingIdx;
                return {
                    ...m,
                    segments: [...m.segments, { type: "thinking", content: "", isActive: true, startTime: Date.now() }],
                };
            });
        }

        // Continue streaming for AI response after tool execution
        const { textContent: newText, reasoningContent: newReasoning } = await processStream();

        // Recursively handle more tool calls or finish
        await finalizeToolCallsAndContinue(newText, newReasoning);
    }, [historyRef, executeTool, supportsThinking, updateAssistant, processStream]);

    // Send message (matches iOS ChatViewModel.send)
    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setInput("");
        setError(null);

        // Clear reasoning from previous turns (matches iOS clearReasoningFromHistory)
        clearReasoningFromHistory();

        // Add user message to UI
        const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, segments: [{ type: "text", content: text }] };
        setMessages((prev) => [...prev, userMsg]);

        // Add to history with context
        historyRef.current.push({ role: "user", content: buildContext(text) });

        // Create assistant message with initial thinking segment if supported
        const assistantId = crypto.randomUUID();
        const initialSegments: Segment[] = supportsThinking
            ? [{ type: "thinking", content: "", isActive: true, startTime: Date.now() }]
            : [];
        const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", segments: initialSegments, isStreaming: true };

        setMessages((prev) => {
            currentMsgIndexRef.current = prev.length;
            currentThinkingIndexRef.current = supportsThinking ? 0 : null;
            return [...prev, assistantMsg];
        });

        setIsLoading(true);
        abortRef.current = new AbortController();
        toolCallsRef.current = {};
        accumulatedReasoningRef.current = "";
        currentTextSegmentRef.current = -1;

        // Process stream
        const { textContent, reasoningContent } = await processStream();

        // Handle tool calls or finalize
        await finalizeToolCallsAndContinue(textContent, reasoningContent);
    }, [input, isLoading, clearReasoningFromHistory, setMessages, historyRef, buildContext, supportsThinking, processStream, finalizeToolCallsAndContinue]);

    const handleStop = useCallback(() => {
        abortRef.current?.abort();
        finalizeCurrentThinking();
        setIsLoading(false);
    }, [finalizeCurrentThinking]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const onSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        handleSend();
    };

    return (
        <div className="flex flex-col h-full">
            <ScrollShadow ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-auto">
                {messages.length === 0 ? <EmptyState /> : messages.map((msg) => <MessageCard key={msg.id} message={msg} />)}
                {isLoading && messages[messages.length - 1]?.segments.length === 0 && <TypingIndicator />}
                {error && <ErrorDisplay error={error} onRetry={handleSend} />}
            </ScrollShadow>

            <div className="border-t border-divider p-4 space-y-3">
                <ScrollShadow hideScrollBar orientation="horizontal" className="flex gap-2">
                    {IDEA_SUGGESTIONS.map((idea) => (
                        <Button key={idea} variant="flat" size="sm" onPress={() => setInput(idea)} className="shrink-0">
                            {idea}
                        </Button>
                    ))}
                </ScrollShadow>

                <form onSubmit={onSubmit} className="rounded-medium bg-default-100 hover:bg-default-200/70 transition-colors">
                    <Textarea
                        value={input}
                        onValueChange={setInput}
                        placeholder="Describe what you want to create..."
                        minRows={3}
                        variant="flat"
                        radius="lg"
                        classNames={{ inputWrapper: "bg-transparent shadow-none", input: "py-0 text-medium" }}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSubmit())}
                    />
                    <div className="flex items-center justify-between px-4 pb-3">
                        <div>
                            {isLoading && (
                                <Button size="sm" variant="flat" color="danger" startContent={<Icon icon="solar:stop-bold" />} onPress={handleStop}>
                                    Stop
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-tiny text-default-400">{input.length}/2000</span>
                            <Tooltip content="Send">
                                <Button isIconOnly color={input.trim() ? "primary" : "default"} isDisabled={!input.trim() || isLoading} radius="lg" size="sm" type="submit">
                                    <Icon icon="solar:arrow-up-linear" className="text-lg" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </form>
                <p className="text-tiny text-default-400 text-center">Swipop AI can make mistakes. Review the generated code before publishing.</p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon icon="solar:magic-stick-3-bold" className="text-6xl text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Create with AI</h2>
            <p className="text-default-500 max-w-md">Describe what you want to build and I'll generate the HTML, CSS, and JavaScript for you.</p>
        </div>
    );
}

function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="flex items-center gap-2 text-danger text-small p-3 bg-danger/10 rounded-medium border border-danger/30">
            <Icon icon="solar:danger-triangle-bold" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="flat" color="danger" onPress={onRetry}>
                Retry
            </Button>
        </div>
    );
}
