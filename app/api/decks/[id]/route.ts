import { getSupabaseAdmin, isSupabaseConfigured, toLegacyDeck } from "../../_shared/supabase";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
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
		if (!deckId) {
			return Response.json({ error: "deck id is required." }, { status: 400 });
		}

		const supabase = getSupabaseAdmin();
		const { error: deleteError } = await supabase
			.from("decks")
			.delete()
			.eq("id", deckId);
		if (deleteError) throw deleteError;

		const { data, error } = await supabase
			.from("decks")
			.select("*")
			.order("updated_at", { ascending: false });
		if (error) throw error;
		return Response.json(data.map(toLegacyDeck));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to delete deck.";
		return Response.json({ error: message }, { status: 500 });
	}
}
