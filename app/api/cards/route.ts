import { readFile } from "node:fs/promises";
import path from "node:path";
import {
	getSupabaseAdmin,
	getSupabaseCardsBucket,
	isSupabaseConfigured,
} from "../_shared/supabase";

const CANDIDATE_PATHS = [
	path.join(process.cwd(), "../gcg_deckmaker/src/data/cards.json"),
	path.join(process.cwd(), "public/cards.json"),
];

export async function GET() {
	if (isSupabaseConfigured()) {
		try {
			const supabase = getSupabaseAdmin();
			const bucket = getSupabaseCardsBucket();

			const cards = await supabase.storage.from(bucket).download("cards.json");
			if (!cards.error && cards.data) {
				const text = await cards.data.text();
				return new Response(text, {
					status: 200,
					headers: { "content-type": "application/json; charset=utf-8" },
				});
			}
		} catch {
			// Fall back to local files.
		}
	}

	for (const filePath of CANDIDATE_PATHS) {
		try {
			const file = await readFile(filePath, "utf-8");
			return new Response(file, {
				status: 200,
				headers: { "content-type": "application/json; charset=utf-8" },
			});
		} catch {
			// Try next candidate.
		}
	}

	return Response.json(
		{ error: "cards.json not found in storage or fallback paths." },
		{ status: 404 },
	);
}
