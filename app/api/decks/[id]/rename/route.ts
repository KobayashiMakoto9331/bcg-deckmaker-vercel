import {
	assertDeckNameWithinLimit,
	fetchLegacyDecks,
} from "@/app/api/_shared/decks";
import {
	getSupabaseAdmin,
	isSupabaseConfigured,
} from "@/app/api/_shared/supabase";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
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
		const { id } = await context.params;
		const deckId = String(id ?? "");
		const body = await req.json();
		const newName = String(body?.name ?? "").trim();
		if (!deckId || !newName) {
			return Response.json(
				{ error: "deck id and name are required." },
				{ status: 400 },
			);
		}
		assertDeckNameWithinLimit(newName);

		const supabase = getSupabaseAdmin();
		const { error } = await supabase
			.from("decks")
			.update({ name: newName, updated_at: new Date().toISOString() })
			.eq("id", deckId);
		if (error) throw error;

		return Response.json(await fetchLegacyDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to rename deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
