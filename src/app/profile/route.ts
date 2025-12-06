import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
    }

    // Get user's profile to get username
    const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

    const username = profile?.username || user.id;
    return NextResponse.redirect(new URL(`/profile/${username}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
