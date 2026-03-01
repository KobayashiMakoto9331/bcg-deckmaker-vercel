import {
	assertDeckNameWithinLimit,
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

export async function POST(_: Request, context: RouteContext) {
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
		const sourceId = String(id ?? "");
		const supabase = getSupabaseAdmin();

		const { data: sourceDeck, error } = await supabase
			.from("decks")
			.select("*")
			.eq("id", sourceId)
			.maybeSingle();
		if (error) throw error;
		if (!sourceDeck) {
			return Response.json({ error: "Deck not found." }, { status: 404 });
		}

		const allDecks = await fetchLegacyDecks();
		const baseName = `${sourceDeck.name} COPY`;
		const newName = createUniqueDeckName(
			baseName,
			allDecks.map((d) => d.name),
		);
		assertDeckNameWithinLimit(newName);

		const { error: insertError } = await supabase.from("decks").insert({
			id: generateDeckId(),
			name: newName,
			owner_id: sourceDeck.owner_id,
			is_public: sourceDeck.is_public,
			cards: sourceDeck.cards,
			icon_cards: sourceDeck.icon_cards,
		});
		if (insertError) throw insertError;

		return Response.json(await fetchLegacyDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to copy deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
