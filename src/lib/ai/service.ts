/**
 * AI Service - Calls Supabase Edge Function for AI chat
 * Mirrors iOS AIService.swift implementation
 */

import { createClient } from "@/lib/supabase/client";

// Edge Function URL
const getEdgeFunctionURL = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/ai-chat`;
};

// Tool definitions (matches iOS AIService.tools)
const tools = [
    // Metadata
    tool("update_metadata", "Update project metadata. Only provide fields you want to change.", {
        title: prop("string", "Project title"),
        description: prop("string", "Brief description"),
        tags: { type: "array", items: { type: "string" }, description: "Tags for discovery" },
    }),

    // Write (full replacement)
    tool(
        "write_html",
        "Replace entire HTML content. Use for new projects or complete rewrites. Do NOT include <html>, <head>, or <body> tags.",
        { content: prop("string", "Complete HTML content") },
        ["content"],
    ),
    tool("write_css", "Replace entire CSS content. Use for new projects or complete rewrites.", { content: prop("string", "Complete CSS content") }, ["content"]),
    tool("write_javascript", "Replace entire JavaScript content. Use for new projects or complete rewrites.", { content: prop("string", "Complete JavaScript content") }, ["content"]),

    // Replace (targeted edits)
    tool(
        "replace_in_html",
        "Make targeted edits to HTML. The search text must match exactly and be unique.",
        { search: prop("string", "Exact text to find (must be unique)"), replace: prop("string", "New text to substitute") },
        ["search", "replace"],
    ),
    tool(
        "replace_in_css",
        "Make targeted edits to CSS. The search text must match exactly and be unique.",
        { search: prop("string", "Exact text to find (must be unique)"), replace: prop("string", "New text to substitute") },
        ["search", "replace"],
    ),
    tool(
        "replace_in_javascript",
        "Make targeted edits to JavaScript. The search text must match exactly and be unique.",
        { search: prop("string", "Exact text to find (must be unique)"), replace: prop("string", "New text to substitute") },
        ["search", "replace"],
    ),

    // Context Management
    tool(
        "summarize_conversation",
        "Create a summary when context window is nearly full. Only call when explicitly instructed.",
        { summary: prop("string", "Comprehensive summary including: user's goals, key decisions, completed tasks, current project progress, and user preferences") },
        ["summary"],
    ),
];

// Tool builder helpers (matches iOS)
function tool(name: string, description: string, properties: Record<string, unknown>, required?: string[]) {
    const params: Record<string, unknown> = { type: "object", properties };
    if (required) params.required = required;
    return { type: "function", function: { name, description, parameters: params } };
}

function prop(type: string, description: string) {
    return { type, description };
}

// Stream event types (matches iOS StreamEvent)
export type StreamEvent =
    | { type: "reasoning"; content: string }
    | { type: "content"; content: string }
    | { type: "tool_call_start"; index: number; id: string; name: string }
    | { type: "tool_call_arguments"; index: number; delta: string }
    | { type: "tool_call_complete"; index: number; arguments: string }
    | { type: "usage"; promptTokens: number; completionTokens: number; reasoningTokens: number }
    | { type: "error"; message: string }
    | { type: "done" };

// Import AIModel from layout to avoid duplication
import type { AIModel } from "@/app/(main)/create/layout";

export interface StreamChatOptions {
    messages: Array<{ role: string; content: string }>;
    model: AIModel;
    onEvent: (event: StreamEvent) => void;
    signal?: AbortSignal;
}

/**
 * Stream chat with AI via Supabase Edge Function
 * Mirrors iOS AIService.streamChat()
 */
export async function streamChat({ messages, model, onEvent, signal }: StreamChatOptions): Promise<void> {
    const supabase = createClient();

    // Get current session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        onEvent({ type: "error", message: "Please sign in to use AI" });
        return;
    }

    const body: Record<string, unknown> = {
        model,
        messages,
        tools,
    };

    // Enable thinking for reasoner model
    if (model === "deepseek-reasoner") {
        body.thinking = { type: "enabled" };
    }

    const response = await fetch(getEdgeFunctionURL(), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok) {
        onEvent({ type: "error", message: `Server error: ${response.status}` });
        return;
    }

    if (!response.body) {
        onEvent({ type: "error", message: "Invalid server response" });
        return;
    }

    // Parse SSE stream (mirrors iOS parsing logic)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const toolCallArguments: Record<number, string> = {};
    const toolCallStarted = new Set<number>();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.startsWith("data: ") || line === "data: [DONE]") continue;

                const jsonStr = line.slice(6);
                let json: Record<string, unknown>;
                try {
                    json = JSON.parse(jsonStr);
                } catch {
                    continue;
                }

                // Parse usage (appears in last chunk)
                if (json.usage && typeof json.usage === "object") {
                    const usage = json.usage as Record<string, unknown>;
                    const promptTokens = (usage.prompt_tokens as number) || 0;
                    const completionTokens = (usage.completion_tokens as number) || 0;
                    let reasoningTokens = 0;
                    if (usage.completion_tokens_details && typeof usage.completion_tokens_details === "object") {
                        const details = usage.completion_tokens_details as Record<string, unknown>;
                        reasoningTokens = (details.reasoning_tokens as number) || 0;
                    }
                    onEvent({ type: "usage", promptTokens, completionTokens, reasoningTokens });
                }

                const choices = json.choices as Array<Record<string, unknown>> | undefined;
                if (!choices?.[0]) continue;
                const delta = choices[0].delta as Record<string, unknown> | undefined;
                if (!delta) continue;

                // Reasoning content
                if (typeof delta.reasoning_content === "string" && delta.reasoning_content) {
                    onEvent({ type: "reasoning", content: delta.reasoning_content });
                }

                // Text content
                if (typeof delta.content === "string" && delta.content) {
                    onEvent({ type: "content", content: delta.content });
                }

                // Tool calls
                const toolCalls = delta.tool_calls as Array<Record<string, unknown>> | undefined;
                if (toolCalls) {
                    for (const tc of toolCalls) {
                        const index = (tc.index as number) || 0;

                        if (toolCallArguments[index] === undefined) {
                            toolCallArguments[index] = "";
                        }

                        const id = tc.id as string | undefined;
                        const func = tc.function as Record<string, unknown> | undefined;
                        const name = func?.name as string | undefined;

                        if (id && name && !toolCallStarted.has(index)) {
                            toolCallStarted.add(index);
                            onEvent({ type: "tool_call_start", index, id, name });
                        }

                        const args = func?.arguments as string | undefined;
                        if (args) {
                            toolCallArguments[index] += args;
                            onEvent({ type: "tool_call_arguments", index, delta: args });
                        }
                    }
                }

                // Finish reason
                const finishReason = choices[0].finish_reason as string | undefined;
                if (finishReason === "tool_calls") {
                    for (const index of Object.keys(toolCallArguments).map(Number).sort()) {
                        onEvent({ type: "tool_call_complete", index, arguments: toolCallArguments[index] || "" });
                    }
                    // Clear for potential next round
                    Object.keys(toolCallArguments).forEach((k) => delete toolCallArguments[Number(k)]);
                    toolCallStarted.clear();
                }
            }
        }

        onEvent({ type: "done" });
    } catch (err) {
        if (signal?.aborted) {
            onEvent({ type: "done" });
        } else {
            onEvent({ type: "error", message: err instanceof Error ? err.message : "Stream error" });
        }
    }
}
