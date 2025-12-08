"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectEditor } from "@/app/create/layout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PageLoading } from "@/components/ui/LoadingState";
import CreatePage from "@/app/create/page";

/**
 * Edit existing project page
 * Loads project data and renders the same UI as create page
 */
export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { load, projectId } = useProjectEditor();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const id = params.id as string;

    useEffect(() => {
        // Skip if already loaded this project
        if (projectId === id) {
            setLoading(false);
            return;
        }

        async function loadProject() {
            if (!user) {
                setError("Please sign in to edit");
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data, error: fetchError } = await supabase
                    .from("projects")
                    .select("id, title, description, tags, html_content, css_content, js_content, is_published, chat_messages, user_id")
                    .eq("id", id)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error("Project not found");
                if (data.user_id !== user.id) {
                    router.push(`/project/${id}`);
                    return;
                }

                load(data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load project");
                setLoading(false);
            }
        }

        loadProject();
    }, [id, user, load, projectId, router]);

    if (loading) return <PageLoading />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-danger">{error}</p>
                <button onClick={() => router.push("/create")} className="text-primary underline">
                    Create new project instead
                </button>
            </div>
        );
    }

    return <CreatePage />;
}
