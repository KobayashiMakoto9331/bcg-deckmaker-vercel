import {
	createUniqueDeckName,
	fetchLegacyDecks,
	generateDeckId,
} from "@/app/api/_shared/decks";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/api/_shared/supabase";

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
		const deckId = String(id ?? "");
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

		const publicDecks = (await fetchLegacyDecks()).filter(
			(d) => (d.ownerId ?? "public") === "public",
		);
		const newName = createUniqueDeckName(
			deck.name,
			publicDecks.map((d) => d.name),
		);

		const { error: insertError } = await supabase.from("decks").insert({
			id: generateDeckId(),
			name: newName,
			owner_id: null,
			is_public: true,
			cards: deck.cards,
			icon_cards: deck.icon_cards,
		});
		if (insertError) throw insertError;

		return Response.json(await fetchLegacyDecks());
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to export deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
