import { createClient } from "@/lib/supabase/client";

const BUCKET = "thumbnails";

/** Max file size: 5MB (industry standard: Twitter/X, Instagram, Imgur) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Thumbnail aspect ratio presets matching iOS */
export type ThumbnailAspectRatio = "portrait" | "square" | "landscape";

export const ASPECT_RATIOS: Record<ThumbnailAspectRatio, { label: string; ratio: number; icon: string }> = {
    portrait: { label: "3:4", ratio: 3 / 4, icon: "solar:smartphone-2-bold" },
    square: { label: "1:1", ratio: 1, icon: "solar:square-bold" },
    landscape: { label: "4:3", ratio: 4 / 3, icon: "solar:laptop-bold" },
};

export interface ThumbnailUploadResult {
    url: string;
    aspectRatio: number;
}

/**
 * Thumbnail service matching iOS ThumbnailService
 * Handles image cropping and upload to Supabase Storage
 */
export const ThumbnailService = {
    /** Load image from any source (File, Blob, or data URL) */
    loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const isObjectUrl = source instanceof Blob;
            const url = isObjectUrl ? URL.createObjectURL(source) : source;

            img.onload = () => {
                if (isObjectUrl) URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                if (isObjectUrl) URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };
            if (typeof source === "string" && !source.startsWith("data:")) {
                img.crossOrigin = "anonymous";
            }
            img.src = url;
        });
    },

    /** Crop image to specified aspect ratio (center crop) */
    cropToRatio(image: HTMLImageElement, targetRatio: number): HTMLCanvasElement {
        const { naturalWidth: w, naturalHeight: h } = image;
        const currentRatio = w / h;

        let cropWidth = w;
        let cropHeight = h;
        let offsetX = 0;
        let offsetY = 0;

        if (currentRatio > targetRatio) {
            cropWidth = h * targetRatio;
            offsetX = (w - cropWidth) / 2;
        } else {
            cropHeight = w / targetRatio;
            offsetY = (h - cropHeight) / 2;
        }

        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(cropWidth, cropHeight));
        canvas.width = cropWidth * scale;
        canvas.height = cropHeight * scale;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, offsetX, offsetY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

        return canvas;
    },

    /** Convert canvas to JPEG blob */
    canvasToBlob(canvas: HTMLCanvasElement, quality = 0.8): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("Failed to convert to blob"))),
                "image/jpeg",
                quality,
            );
        });
    },

    /** Upload thumbnail to Supabase Storage */
    async upload(blob: Blob, projectId: string, aspectRatio: number): Promise<ThumbnailUploadResult> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const path = `${user.id}/${projectId}.jpg`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, blob, { contentType: "image/jpeg", upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

        return { url: publicUrl, aspectRatio };
    },

    /** Delete thumbnail from storage */
    async delete(projectId: string): Promise<void> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const path = `${user.id}/${projectId}.jpg`;
        await supabase.storage.from(BUCKET).remove([path]);
    },
};
