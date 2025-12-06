"use client";

import React from "react";
import {
    Button,
    Tooltip,
    ScrollShadow,
    Textarea,
    Tabs,
    Tab,
    Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

const ideas = [
    {
        title: "Create a neon button effect",
        description: "with hover animation",
    },
    {
        title: "Build a gradient background",
        description: "animated and colorful",
    },
    {
        title: "Design a loading spinner",
        description: "smooth and minimal",
    },
    {
        title: "Make a card hover effect",
        description: "with 3D transform",
    },
];

export default function CreatePage() {
    const [prompt, setPrompt] = React.useState("");
    const [projectTitle, setProjectTitle] = React.useState("");
    const [htmlContent, setHtmlContent] = React.useState("<div class='container'>\n  <h1>Hello World</h1>\n</div>");
    const [cssContent, setCssContent] = React.useState(`.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  font-size: 3rem;
  font-family: sans-serif;
}`);
    const [jsContent, setJsContent] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("chat");

    const previewSrcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${cssContent}</style>
    </head>
    <body style="margin:0">
      ${htmlContent}
      <script>${jsContent}</script>
    </body>
    </html>
  `;

    const handleIdeaClick = (idea: { title: string; description: string }) => {
        setPrompt(`${idea.title} - ${idea.description}`);
    };

    return (
        <SidebarLayout>
            <div className="min-h-screen flex flex-col p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Untitled Project"
                            value={projectTitle}
                            onValueChange={setProjectTitle}
                            variant="bordered"
                            size="lg"
                            classNames={{
                                input: "text-lg font-medium",
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="flat" startContent={<Icon icon="solar:eye-linear" />}>
                            Preview
                        </Button>
                        <Button color="primary" startContent={<Icon icon="solar:upload-linear" />}>
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Main Content - Tabs */}
                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    classNames={{
                        tabList: "mb-4",
                    }}
                >
                    {/* Chat Tab */}
                    <Tab
                        key="chat"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:chat-round-dots-bold" />
                                <span>Chat</span>
                            </div>
                        }
                    >
                        <div className="flex flex-col gap-4">
                            <ScrollShadow
                                hideScrollBar
                                className="flex flex-nowrap gap-2"
                                orientation="horizontal"
                            >
                                {ideas.map((idea, index) => (
                                    <Button
                                        key={index}
                                        className="flex h-14 flex-col items-start gap-0 shrink-0"
                                        variant="flat"
                                        onPress={() => handleIdeaClick(idea)}
                                    >
                                        <p className="text-small">{idea.title}</p>
                                        <p className="text-tiny text-default-500">{idea.description}</p>
                                    </Button>
                                ))}
                            </ScrollShadow>

                            <div className="rounded-medium bg-default-100 hover:bg-default-200/70 flex flex-col transition-colors">
                                <Textarea
                                    placeholder="Describe what you want to create..."
                                    minRows={4}
                                    value={prompt}
                                    onValueChange={setPrompt}
                                    classNames={{
                                        inputWrapper: "bg-transparent shadow-none",
                                        input: "text-medium",
                                    }}
                                />
                                <div className="flex items-center justify-between px-3 pb-3">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            startContent={<Icon icon="solar:magic-stick-3-bold" className="text-default-500" />}
                                        >
                                            Generate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            startContent={<Icon icon="solar:gallery-bold" className="text-default-500" />}
                                        >
                                            Templates
                                        </Button>
                                    </div>
                                    <Tooltip content="Send to AI">
                                        <Button
                                            isIconOnly
                                            color={prompt ? "primary" : "default"}
                                            isDisabled={!prompt}
                                            radius="lg"
                                            size="sm"
                                        >
                                            <Icon icon="solar:arrow-up-linear" className="text-lg" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    {/* Preview Tab */}
                    <Tab
                        key="preview"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:play-bold" />
                                <span>Preview</span>
                            </div>
                        }
                    >
                        <div className="rounded-large border border-default-200 overflow-hidden h-[500px]">
                            <iframe
                                srcDoc={previewSrcDoc}
                                sandbox="allow-scripts"
                                className="w-full h-full border-0"
                                title="Preview"
                            />
                        </div>
                    </Tab>

                    {/* HTML Tab */}
                    <Tab
                        key="html"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="vscode-icons:file-type-html" />
                                <span>HTML</span>
                            </div>
                        }
                    >
                        <Textarea
                            value={htmlContent}
                            onValueChange={setHtmlContent}
                            minRows={20}
                            classNames={{
                                inputWrapper: "bg-default-50",
                                input: "font-mono text-sm",
                            }}
                        />
                    </Tab>

                    {/* CSS Tab */}
                    <Tab
                        key="css"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="vscode-icons:file-type-css" />
                                <span>CSS</span>
                            </div>
                        }
                    >
                        <Textarea
                            value={cssContent}
                            onValueChange={setCssContent}
                            minRows={20}
                            classNames={{
                                inputWrapper: "bg-default-50",
                                input: "font-mono text-sm",
                            }}
                        />
                    </Tab>

                    {/* JavaScript Tab */}
                    <Tab
                        key="js"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="vscode-icons:file-type-js" />
                                <span>JavaScript</span>
                            </div>
                        }
                    >
                        <Textarea
                            value={jsContent}
                            onValueChange={setJsContent}
                            minRows={20}
                            placeholder="// Add your JavaScript here"
                            classNames={{
                                inputWrapper: "bg-default-50",
                                input: "font-mono text-sm",
                            }}
                        />
                    </Tab>
                </Tabs>

                {/* Footer Status */}
                <div className="flex items-center justify-between mt-4 text-small text-default-400">
                    <div className="flex gap-4">
                        <span>HTML: {htmlContent.length} chars</span>
                        <span>CSS: {cssContent.length} chars</span>
                        <span>JS: {jsContent.length} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:cloud-check-linear" className="text-success" />
                        <span>Auto-saved</span>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
