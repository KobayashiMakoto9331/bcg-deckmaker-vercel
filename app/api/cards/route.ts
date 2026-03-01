import { readFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATE_PATHS = [
	path.join(process.cwd(), "../gcg_deckmaker/public/cards_packed.json"),
	path.join(process.cwd(), "../gcg_deckmaker/src/data/cards.json"),
	path.join(process.cwd(), "public/cards_packed.json"),
	path.join(process.cwd(), "public/cards.json"),
];

export async function GET() {
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
		{ error: "Card data file not found in migration candidates." },
		{ status: 404 },
	);
}
