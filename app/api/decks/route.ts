import { readFile } from "node:fs/promises";
import path from "node:path";
import {
	getSupabaseAdmin,
	isSupabaseConfigured,
	toLegacyDeck,
	type DeckRow,
} from "../_shared/supabase";

const DEFAULT_DECKS: Array<{
	id: string;
	name: string;
	cards: Record<string, number>;
	iconCards?: string[];
	ownerId?: string;
	createdAt?: number;
	updatedAt?: number;
}> = [];

async function ensureDecksSeeded() {
	const supabase = getSupabaseAdmin();
	const { count, error } = await supabase
		.from("decks")
		.select("id", { count: "exact", head: true });
	if (error) throw error;
	if ((count ?? 0) > 0) return;

	let initialDecks = DEFAULT_DECKS;
	try {
		const raw = await readFile(
			path.join(process.cwd(), "public/initial_decks.json"),
			"utf-8",
		);
		initialDecks = JSON.parse(raw);
	} catch {
		// Use defaults if file read fails.
	}

	if (initialDecks.length === 0) return;

	const rows = initialDecks.map((d) => ({
		id: String(d.id),
		name: String(d.name),
		owner_id: d.ownerId && d.ownerId !== "public" ? String(d.ownerId) : null,
		is_public: (d.ownerId ?? "public") === "public",
		cards: d.cards ?? {},
		icon_cards: d.iconCards ?? [],
	}));
	const { error: upsertError } = await supabase
		.from("decks")
		.upsert(rows, { onConflict: "id" });
	if (upsertError) throw upsertError;
}

async function fetchDecks() {
	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase
		.from("decks")
		.select("*")
		.order("updated_at", { ascending: false });
	if (error) throw error;
	return (data as DeckRow[]).map(toLegacyDeck);
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
		await ensureDecksSeeded();
		return Response.json(await fetchDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch decks.";
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

		const ownerId = body?.ownerId;
		const isPublic = (ownerId ?? "public") === "public";
		const cards =
			body?.cards && typeof body.cards === "object" ? body.cards : {};
		const iconCards = Array.isArray(body?.iconCards) ? body.iconCards : [];

		const supabase = getSupabaseAdmin();
		const { error } = await supabase.from("decks").upsert(
			{
				id,
				name,
				owner_id: isPublic ? null : String(ownerId),
				is_public: isPublic,
				cards,
				icon_cards: iconCards,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "id" },
		);
		if (error) throw error;

		return Response.json(await fetchDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to save deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
