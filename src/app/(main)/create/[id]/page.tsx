"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectEditor } from "@/app/(main)/create/layout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PageLoading } from "@/components/ui/LoadingState";
import CreatePage from "@/app/(main)/create/page";
import type { Project } from "@/lib/types";

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
                    .select("*")
                    .eq("id", id)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error("Project not found");
                if (data.user_id !== user.id) {
                    router.push(`/project/${id}`);
                    return;
                }

                load(data as Project);
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
                <Button as={Link} href="/create" variant="light" color="primary">
                    Create new project instead
                </Button>
            </div>
        );
    }

    return <CreatePage />;
}
