import { getSupabaseAdmin, getSupabaseCardsBucket, isSupabaseConfigured } from "@/app/api/_shared/supabase";
import { scrapeCards } from "@/app/api/_shared/card-scraper";

export const maxDuration = 300;

function isAuthorized(req: Request) {
	const expected = process.env.CRON_SECRET;
	if (!expected) return true;
	const authHeader = req.headers.get("authorization");
	return authHeader === `Bearer ${expected}`;
}

export async function GET(req: Request) {
	if (!isAuthorized(req)) {
		return Response.json({ error: "Unauthorized." }, { status: 401 });
	}
	if (!isSupabaseConfigured()) {
		return Response.json(
			{
				error:
					"Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
			},
			{ status: 503 },
		);
	}

	const startedAt = Date.now();

	try {
		const { idsCount, cards } = await scrapeCards();

		const supabase = getSupabaseAdmin();
		const bucket = getSupabaseCardsBucket();

		const cardsJson = JSON.stringify(cards);

		const uploadCards = await supabase.storage
			.from(bucket)
			.upload("cards.json", cardsJson, {
				contentType: "application/json; charset=utf-8",
				upsert: true,
			});
		if (uploadCards.error) throw uploadCards.error;

		const elapsedMs = Date.now() - startedAt;
		return Response.json({
			ok: true,
			idsCount,
			cardsCount: cards.length,
			cardsBytes: Buffer.byteLength(cardsJson, "utf-8"),
			bucket,
			elapsedMs,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Scrape job failed.";
		return Response.json({ error: message }, { status: 500 });
	}
}
