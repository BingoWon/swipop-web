import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const errorDescription = requestUrl.searchParams.get("error_description");

	// If there's an error from OAuth provider, redirect with error info
	if (error) {
		return NextResponse.redirect(
			new URL(
				`/?auth_error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`,
				requestUrl.origin,
			),
		);
	}

	if (code) {
		const supabase = await createClient();
		const { error: exchangeError } =
			await supabase.auth.exchangeCodeForSession(code);

		if (exchangeError) {
			return NextResponse.redirect(
				new URL(
					`/?auth_error=exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}`,
					requestUrl.origin,
				),
			);
		}
	}

	// Redirect to home page after successful authentication
	return NextResponse.redirect(new URL("/", requestUrl.origin));
}
