import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton Supabase browser client
 * Ensures only one instance exists throughout the application lifecycle
 * Prevents unnecessary re-initialization and auth state flickering
 */
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
	if (!client) {
		client = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		);
	}
	return client;
}
