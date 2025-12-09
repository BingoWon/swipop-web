"use client";

import { Button, Card, CardBody, Chip, Input, Progress, Radio, RadioGroup, Switch, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProjectEditor, AI_MODELS, type AIModel } from "@/app/(main)/create/layout";
import { ASPECT_RATIOS, MAX_FILE_SIZE, type ThumbnailAspectRatio } from "@/lib/services/thumbnail";

const CONTEXT_LIMIT = 128_000;
const BUFFER_SIZE = 30_000;
const USABLE_LIMIT = CONTEXT_LIMIT - BUFFER_SIZE;

/**
 * Options panel - matches iOS ProjectOptionsSheet
 * Includes Thumbnail, AI Model, Details, Tags, Visibility, Context
 */
export function OptionsPanel() {
    const {
        projectTitle, setProjectTitle,
        description, setDescription,
        tags, setTags,
        isPublished, setIsPublished,
        selectedModel, setSelectedModel,
        promptTokens,
        reset,
        // Thumbnail
        thumbnailBlob, thumbnailUrl, thumbnailAspectRatio, isCapturingThumbnail,
        captureThumbnail, setThumbnailFromFile, removeThumbnail,
    } = useProjectEditor();

    const [tagInput, setTagInput] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedAspect, setSelectedAspect] = useState<ThumbnailAspectRatio>("portrait");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

    const usagePercentage = USABLE_LIMIT > 0 ? promptTokens / USABLE_LIMIT : 0;

    // Thumbnail preview URL with proper cleanup
    const blobUrl = useMemo(() => thumbnailBlob ? URL.createObjectURL(thumbnailBlob) : null, [thumbnailBlob]);
    useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);
    const thumbnailPreviewUrl = blobUrl || thumbnailUrl;
    const hasThumbnail = !!thumbnailPreviewUrl;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
                e.target.value = "";
                return;
            }
            setThumbnailFromFile(file, selectedAspect);
        }
        e.target.value = ""; // Reset for re-upload
    };

    return (
        <div className="h-full overflow-auto p-4 space-y-6">
            {/* Thumbnail Section */}
            <Section title="Thumbnail" icon="solar:gallery-bold">
                <div className="space-y-4">
                    {/* Preview */}
                    <div className="flex justify-center">
                        <div
                            className="relative bg-content2 rounded-xl overflow-hidden flex items-center justify-center"
                            style={{
                                width: 180,
                                height: 180 / (thumbnailAspectRatio || ASPECT_RATIOS[selectedAspect].ratio),
                            }}
                        >
                            {thumbnailPreviewUrl ? (
                                <img
                                    src={thumbnailPreviewUrl}
                                    alt="Thumbnail preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <Icon icon="solar:camera-bold" className="text-4xl text-default-300" />
                            )}
                            {isCapturingThumbnail && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Icon icon="solar:refresh-bold" className="text-2xl text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div className="flex justify-center gap-2">
                        {(Object.keys(ASPECT_RATIOS) as ThumbnailAspectRatio[]).map((key) => (
                            <Button
                                key={key}
                                size="sm"
                                variant={selectedAspect === key ? "solid" : "flat"}
                                color={selectedAspect === key ? "primary" : "default"}
                                onPress={() => setSelectedAspect(key)}
                                startContent={<Icon icon={ASPECT_RATIOS[key].icon} />}
                            >
                                {ASPECT_RATIOS[key].label}
                            </Button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button
                            fullWidth
                            variant="flat"
                            color="primary"
                            startContent={<Icon icon="solar:camera-bold" />}
                            isLoading={isCapturingThumbnail}
                            onPress={() => captureThumbnail(selectedAspect)}
                        >
                            Capture from Preview
                        </Button>
                        <Button
                            fullWidth
                            variant="flat"
                            startContent={<Icon icon="solar:gallery-add-bold" />}
                            onPress={() => fileInputRef.current?.click()}
                        >
                            Upload from Device
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {hasThumbnail && (
                            <Button
                                fullWidth
                                variant="light"
                                color="danger"
                                startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                                onPress={removeThumbnail}
                            >
                                Remove Thumbnail
                            </Button>
                        )}
                    </div>
                </div>
            </Section>

            {/* AI Model Section */}
            <Section title="AI Model" icon="solar:cpu-bold">
                <RadioGroup value={selectedModel} onValueChange={(v) => setSelectedModel(v as AIModel)}>
                    {Object.values(AI_MODELS).map((model) => (
                        <Radio key={model.id} value={model.id} classNames={{ base: "max-w-full", label: "w-full" }}>
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <p className="font-medium">{model.name}</p>
                                    <p className="text-tiny text-default-500">{model.description}</p>
                                </div>
                                {model.supportsThinking && (
                                    <Chip size="sm" variant="flat" color="primary">
                                        <Icon icon="solar:brain-bold" className="mr-1" />
                                        Thinking
                                    </Chip>
                                )}
                            </div>
                        </Radio>
                    ))}
                </RadioGroup>
            </Section>

            {/* Details Section */}
            <Section title="Details" icon="solar:document-text-bold">
                <div className="space-y-4">
                    <Input label="Title" placeholder="Enter project title" value={projectTitle} onValueChange={setProjectTitle} variant="bordered" labelPlacement="outside" />
                    <Textarea label="Description" placeholder="Enter project description" value={description} onValueChange={setDescription} variant="bordered" labelPlacement="outside" minRows={2} maxRows={4} />
                </div>
            </Section>

            {/* Tags Section */}
            <Section title="Tags" icon="solar:tag-bold">
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input placeholder="Add tag..." value={tagInput} onValueChange={setTagInput} variant="bordered" size="sm" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                        <Button isIconOnly variant="flat" size="sm" onPress={addTag} isDisabled={!tagInput.trim()}>
                            <Icon icon="solar:add-circle-bold" className="text-lg" />
                        </Button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Chip key={tag} onClose={() => removeTag(tag)} variant="flat" color="primary" size="sm">
                                    {tag}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {/* Visibility Section */}
            <Section title="Visibility" icon="solar:eye-bold">
                <Card className="bg-content2">
                    <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{isPublished ? "Published" : "Draft"}</p>
                                <p className="text-tiny text-default-500">{isPublished ? "Everyone can see this project" : "Only you can see this project"}</p>
                            </div>
                            <Switch isSelected={isPublished} onValueChange={setIsPublished} color="success" />
                        </div>
                    </CardBody>
                </Card>
            </Section>

            {/* Context Window Section */}
            <Section title="Context" icon="solar:brain-bold" footer="Auto-summarize is enabled. Conversation will be compacted when needed.">
                <Card className="bg-content2">
                    <CardBody className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Progress value={usagePercentage * 100} color={usagePercentage >= 0.8 ? "danger" : usagePercentage >= 0.6 ? "warning" : "success"} size="sm" />
                            <div className="flex justify-between text-tiny text-default-500">
                                <span>Used: {formatTokens(promptTokens)}</span>
                                <span>Available: {formatTokens(USABLE_LIMIT - promptTokens)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <StatItem label="Used" value={formatTokens(promptTokens)} color={usagePercentage >= 0.8 ? "text-danger" : usagePercentage >= 0.6 ? "text-warning" : "text-success"} />
                            <StatItem label="Available" value={formatTokens(USABLE_LIMIT - promptTokens)} />
                            <StatItem label="Buffer" value={formatTokens(BUFFER_SIZE)} color="text-default-400" />
                            <StatItem label="Total" value="128K" color="text-default-400" />
                        </div>
                    </CardBody>
                </Card>
            </Section>

            {/* Danger Section */}
            <Section title="Danger Zone" icon="solar:danger-triangle-bold">
                {!showDeleteConfirm ? (
                    <Button color="danger" variant="flat" startContent={<Icon icon="solar:trash-bin-trash-bold" />} onPress={() => setShowDeleteConfirm(true)}>
                        Delete Project
                    </Button>
                ) : (
                    <Card className="bg-danger/10 border border-danger/30">
                        <CardBody className="p-4">
                            <p className="text-small text-danger mb-3">This will permanently delete your project. This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <Button color="danger" size="sm" onPress={() => { reset(); setShowDeleteConfirm(false); }}>Delete</Button>
                                <Button variant="flat" size="sm" onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </Section>
        </div>
    );
}

function Section({ title, icon, footer, children }: { title: string; icon: string; footer?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-default-500">
                <Icon icon={icon} className="text-lg" />
                <span className="text-small font-medium uppercase tracking-wide">{title}</span>
            </div>
            {children}
            {footer && <p className="text-tiny text-default-400">{footer}</p>}
        </div>
    );
}

function StatItem({ label, value, color = "text-foreground" }: { label: string; value: string; color?: string }) {
    return (
        <div>
            <p className={`text-small font-semibold ${color}`}>{value}</p>
            <p className="text-tiny text-default-400">{label}</p>
        </div>
    );
}

function formatTokens(count: number): string {
    if (count >= 1000) return `${Math.round(count / 1000)}K`;
    return String(count);
}

