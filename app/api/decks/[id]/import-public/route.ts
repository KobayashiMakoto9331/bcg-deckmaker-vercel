import {
	createUniqueDeckName,
	fetchLegacyDecks,
	generateDeckId,
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
		const targetUserId = String(body?.targetUserId ?? "");
		if (!targetUserId) {
			return Response.json(
				{ error: "targetUserId is required." },
				{ status: 400 },
			);
		}

		const supabase = getSupabaseAdmin();
		const { data: deck, error } = await supabase
			.from("decks")
			.select("*")
			.eq("id", deckId)
			.maybeSingle();
		if (error) throw error;
		if (!deck) {
			return Response.json({ error: "Deck not found." }, { status: 404 });
		}

		const userDecks = (await fetchLegacyDecks()).filter(
			(d) => d.ownerId === targetUserId,
		);
		const newName = createUniqueDeckName(
			deck.name,
			userDecks.map((d) => d.name),
		);

		const { error: insertError } = await supabase.from("decks").insert({
			id: generateDeckId(),
			name: newName,
			owner_id: targetUserId,
			is_public: false,
			cards: deck.cards,
			icon_cards: deck.icon_cards,
		});
		if (insertError) throw insertError;

		return Response.json(await fetchLegacyDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to import deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
