"use client";

import {
    Avatar,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileLink } from "@/lib/types";

interface EditProfileModalProps {
    profile: Profile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updated: Profile) => void;
}

/**
 * Edit Profile Modal - matches iOS EditProfileView
 * Supports avatar upload, display name, username, bio, and links
 */
export function EditProfileModal({ profile, isOpen, onClose, onSave }: EditProfileModalProps) {
    const [displayName, setDisplayName] = React.useState(profile.display_name || "");
    const [username, setUsername] = React.useState(profile.username || "");
    const [bio, setBio] = React.useState(profile.bio || "");
    const [links, setLinks] = React.useState<ProfileLink[]>(profile.links || []);
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = React.useState<string>(profile.avatar_url || "");
    const [isSaving, setIsSaving] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setDisplayName(profile.display_name || "");
            setUsername(profile.username || "");
            setBio(profile.bio || "");
            setLinks(profile.links || []);
            setAvatarPreview(profile.avatar_url || "");
            setAvatarFile(null);
        }
    }, [isOpen, profile]);

    const handleAddLink = () => setLinks([...links, { title: "", url: "" }]);
    const handleRemoveLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
    const handleLinkChange = (index: number, field: keyof ProfileLink, value: string) => {
        const updated = [...links];
        updated[index] = { ...updated[index], [field]: value };
        setLinks(updated);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max size is 5MB.");
                return;
            }
            // Revoke old object URL to prevent memory leak
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Error uploading avatar:", uploadError);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let newAvatarUrl = profile.avatar_url;

            if (avatarFile) {
                const uploadedUrl = await uploadAvatar(profile.id, avatarFile);
                if (uploadedUrl) {
                    newAvatarUrl = uploadedUrl;
                }
            }

            const validLinks = links.filter((l) => l.title && l.url);
            const updated = await UserService.updateProfile(profile.id, {
                display_name: displayName || null,
                username: username || null,
                bio: bio || null,
                links: validLinks,
                avatar_url: newAvatarUrl,
            });

            if (updated) {
                onSave(updated);
                onClose();
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>Edit Profile</ModalHeader>
                <ModalBody className="gap-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                            <Avatar
                                src={avatarPreview}
                                className="w-24 h-24 text-large"
                                isBordered
                            />
                            <div
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Icon icon="solar:camera-bold" className="text-2xl" />
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => fileInputRef.current?.click()}
                        >
                            Change Photo
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Display Name"
                            placeholder="Your name"
                            value={displayName}
                            onValueChange={setDisplayName}
                        />
                        <Input
                            label="Username"
                            placeholder="username"
                            value={username}
                            onValueChange={setUsername}
                            startContent={<span className="text-default-400 text-sm">@</span>}
                        />
                        <Textarea
                            label="Bio"
                            placeholder="Tell us about yourself"
                            value={bio}
                            onValueChange={setBio}
                            minRows={2}
                            maxRows={4}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Links</span>
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={handleAddLink}
                                startContent={<Icon icon="solar:add-circle-bold" />}
                            >
                                Add Link
                            </Button>
                        </div>
                        {links.map((link, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <Input
                                    size="sm"
                                    placeholder="Title"
                                    value={link.title}
                                    onValueChange={(v) => handleLinkChange(i, "title", v)}
                                    className="flex-1"
                                />
                                <Input
                                    size="sm"
                                    placeholder="https://..."
                                    value={link.url}
                                    onValueChange={(v) => handleLinkChange(i, "url", v)}
                                    className="flex-[2]"
                                />
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => handleRemoveLink(i)}
                                >
                                    <Icon icon="solar:trash-bin-trash-bold" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" onPress={handleSave} isLoading={isSaving}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
