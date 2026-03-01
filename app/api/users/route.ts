import { readFile } from "node:fs/promises";
import path from "node:path";
import {
	type AppUserRow,
	getSupabaseAdmin,
	isSupabaseConfigured,
	toLegacyUser,
} from "../_shared/supabase";

const DEFAULT_USERS = [{ id: "public", name: "Public", isReadOnly: true }];

async function ensureUsersSeeded() {
	const supabase = getSupabaseAdmin();
	const { count, error } = await supabase
		.from("app_users")
		.select("id", { count: "exact", head: true });
	if (error) throw error;
	if ((count ?? 0) > 0) return;

	let initialUsers = DEFAULT_USERS;
	try {
		const raw = await readFile(
			path.join(process.cwd(), "public/initial_users.json"),
			"utf-8",
		);
		initialUsers = JSON.parse(raw);
	} catch {
		// Use defaults if file read fails.
	}

	const rows = initialUsers.map((u: any) => ({
		id: String(u.id),
		name: String(u.name),
		is_read_only: Boolean(u.isReadOnly ?? u.is_read_only ?? false),
	}));
	const { error: upsertError } = await supabase
		.from("app_users")
		.upsert(rows, { onConflict: "id" });
	if (upsertError) throw upsertError;
}

export async function GET() {
	if (!isSupabaseConfigured()) {
		return Response.json(
			{
				error:
					"Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
			},
			{ status: 503 },
		);
	}

	try {
		await ensureUsersSeeded();
		const supabase = getSupabaseAdmin();
		const { data, error } = await supabase
			.from("app_users")
			.select("*")
			.order("created_at", { ascending: true });
		if (error) throw error;
		return Response.json((data as AppUserRow[]).map(toLegacyUser));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch users.";
		return Response.json({ error: message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	if (!isSupabaseConfigured()) {
		return Response.json(
			{
				error:
					"Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
			},
			{ status: 503 },
		);
	}

	try {
		const body = await req.json();
		const id = String(body?.id ?? "");
		const name = String(body?.name ?? "").trim();
		if (!id || !name) {
			return Response.json(
				{ error: "id and name are required." },
				{ status: 400 },
			);
		}

		const supabase = getSupabaseAdmin();
		const { data: duplicate, error: duplicateError } = await supabase
			.from("app_users")
			.select("id")
			.eq("name", name)
			.neq("id", id)
			.limit(1)
			.maybeSingle();
		if (duplicateError) throw duplicateError;
		if (duplicate) {
			return Response.json(
				{ error: "同名のユーザーが既に存在します。" },
				{ status: 409 },
			);
		}

		const { data: existing, error: existingError } = await supabase
			.from("app_users")
			.select("id,is_read_only")
			.eq("id", id)
			.maybeSingle();
		if (existingError) throw existingError;
		if (existing?.is_read_only) {
			return Response.json(
				{ error: "このユーザーは変更できません。" },
				{ status: 400 },
			);
		}

		const { error: upsertError } = await supabase.from("app_users").upsert(
			{
				id,
				name,
			},
			{ onConflict: "id" },
		);
		if (upsertError) throw upsertError;

		const { data, error } = await supabase
			.from("app_users")
			.select("*")
			.order("created_at", { ascending: true });
		if (error) throw error;
		return Response.json((data as AppUserRow[]).map(toLegacyUser));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to save user.";
		return Response.json({ error: message }, { status: 500 });
	}
}
