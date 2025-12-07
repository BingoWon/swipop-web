import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const errorDescription = requestUrl.searchParams.get("error_description");

	console.log("[Auth Callback] URL:", requestUrl.toString());
	console.log("[Auth Callback] code:", code ? "present" : "missing");
	console.log("[Auth Callback] error:", error);
	console.log("[Auth Callback] error_description:", errorDescription);

	// If there's an error from OAuth provider, redirect with error info
	if (error) {
		console.error("[Auth Callback] OAuth Error:", error, errorDescription);
		return NextResponse.redirect(
			new URL(`/?auth_error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`, requestUrl.origin)
		);
	}

	if (code) {
		const supabase = await createClient();
		console.log("[Auth Callback] Exchanging code for session...");

		const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

		if (exchangeError) {
			console.error("[Auth Callback] Exchange Error:", exchangeError);
			return NextResponse.redirect(
				new URL(`/?auth_error=exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
			);
		}

		console.log("[Auth Callback] Session created for user:", data.user?.id);
		console.log("[Auth Callback] User email:", data.user?.email);
	} else {
		console.log("[Auth Callback] No code provided");
	}

	// Redirect to home page after successful authentication
	return NextResponse.redirect(new URL("/", requestUrl.origin));
}
