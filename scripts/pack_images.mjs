import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_JSON = path.join(__dirname, "../public/cards.json");
const OUTPUT_JSON = path.join(__dirname, "../public/cards_packed.json");
const PUBLIC_DIR = path.join(__dirname, "../public");

async function packImages() {
	console.log(`Reading cards from ${INPUT_JSON}...`);
	if (!fs.existsSync(INPUT_JSON)) {
		console.error("Input JSON not found.");
		process.exit(1);
	}

	const cards = JSON.parse(fs.readFileSync(INPUT_JSON, "utf-8"));
	let successCount = 0;
	let failCount = 0;

	console.log(`Processing ${cards.length} cards...`);

	for (const card of cards) {
		if (!card.image) continue;

		const relativePath = card.image.startsWith("/")
			? card.image.slice(1)
			: card.image;
		const fullPath = path.join(PUBLIC_DIR, relativePath);

		if (fs.existsSync(fullPath)) {
			try {
				const buffer = fs.readFileSync(fullPath);
				const base64 = buffer.toString("base64");
				const ext = path.extname(fullPath).toLowerCase().replace(".", "");
				let mime = "image/jpeg";
				if (ext === "png") mime = "image/png";
				if (ext === "webp") mime = "image/webp";
				if (ext === "gif") mime = "image/gif";
				if (ext === "svg") mime = "image/svg+xml";
				card.image = `data:${mime};base64,${base64}`;
				successCount++;
			} catch (e) {
				console.error(`Failed to read/encode ${fullPath}:`, e.message);
				failCount++;
			}
		} else {
			failCount++;
		}
	}

	console.log(`Writing packed JSON to ${OUTPUT_JSON}...`);
	fs.writeFileSync(OUTPUT_JSON, JSON.stringify(cards));
	const stat = fs.statSync(OUTPUT_JSON);
	console.log(`Done. Packed Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB.`);
	console.log(`Success: ${successCount}, Failed/Skipped: ${failCount}`);
}

packImages();
