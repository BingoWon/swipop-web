#!/usr/bin/env node
/**
 * Supabase Database Health Check Tool
 * Usage: node scripts/db-query.js --check
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error("Error: Missing required environment variables.");
	console.error(
		"Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local",
	);
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabase() {
	console.log("=== Database Health Check ===\n");

	// 1. Check auth users
	console.log("1. Auth Users:");
	const { data: authUsers } = await supabase.auth.admin.listUsers();
	console.log(`   Count: ${authUsers?.users?.length || 0}`);
	for (const u of authUsers?.users || []) {
		console.log(`   - ${u.id} (${u.email})`);
	}

	// 2. Check public users
	console.log("\n2. Public Users:");
	const { data: pubUsers, error: pubErr } = await supabase
		.from("users")
		.select("id, username, display_name");
	if (pubErr) {
		console.log(`   Error: ${pubErr.message}`);
	} else {
		console.log(`   Count: ${pubUsers?.length || 0}`);
		for (const u of pubUsers || []) {
			console.log(`   - ${u.id} (${u.username})`);
		}
	}

	// 3. Check if IDs match
	console.log("\n3. ID Sync Check:");
	const authIds = new Set(authUsers?.users?.map((u) => u.id) || []);
	const pubIds = new Set(pubUsers?.map((u) => u.id) || []);

	const missingInPublic = [...authIds].filter((id) => !pubIds.has(id));
	const extraInPublic = [...pubIds].filter((id) => !authIds.has(id));

	if (missingInPublic.length > 0) {
		console.log(`   ⚠️ Missing in public.users: ${missingInPublic.join(", ")}`);
	}
	if (extraInPublic.length > 0) {
		console.log(`   ⚠️ Extra in public.users: ${extraInPublic.join(", ")}`);
	}
	if (missingInPublic.length === 0 && extraInPublic.length === 0) {
		console.log("   ✅ All auth users have corresponding public users");
	}

	// 4. Test function
	console.log("\n4. Function Test:");
	try {
		const { data: fnTest } = await supabase.rpc("generate_username", {
			display_name: "Test",
		});
		console.log(`   generate_username('Test') = ${fnTest}`);
	} catch (e) {
		console.log(`   generate_username test failed: ${e.message}`);
	}
}

// Main
const args = process.argv.slice(2);

if (args[0] === "--check" || args[0] === "-c" || args.length === 0) {
	checkDatabase();
} else {
	console.log("Usage:");
	console.log(
		"  node scripts/db-query.js --check  # Run database health check",
	);
}
