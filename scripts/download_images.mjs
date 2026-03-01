import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_JSON_PATH = path.join(__dirname, "../public/cards.json");
const IMAGES_DIR = path.join(__dirname, "../public/images/cards");

async function ensureDir() {
	await fs.mkdir(IMAGES_DIR, { recursive: true });
}

async function downloadImage(url, filepath) {
	try {
		const response = await axios({
			url,
			method: "GET",
			responseType: "arraybuffer",
		});
		await fs.writeFile(filepath, response.data);
		return true;
	} catch (error) {
		console.error(`Error downloading ${url}:`, error.message);
		return false;
	}
}

async function exists(filepath) {
	try {
		await fs.access(filepath);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	try {
		await ensureDir();
		const data = await fs.readFile(CARDS_JSON_PATH, "utf-8");
		const cards = JSON.parse(data);

		console.log(`Processing ${cards.length} cards...`);

		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			if (!card.image) continue;
			if (card.image.startsWith("/images")) continue;

			const ext = path.extname(new URL(card.image).pathname) || ".png";
			const safeId = card.id.replace(/[^a-zA-Z0-9-_]/g, "_");
			const filename = `${safeId}${ext}`;
			const localPath = path.join(IMAGES_DIR, filename);
			const publicPath = `/images/cards/${filename}`;

			if (!(await exists(localPath))) {
				console.log(`[${i + 1}/${cards.length}] Downloading ${card.id}...`);
				await downloadImage(card.image, localPath);
				await new Promise((r) => setTimeout(r, 100));
			}

			card.image = publicPath;
		}

		console.log("Updating cards.json...");
		await fs.writeFile(CARDS_JSON_PATH, JSON.stringify(cards, null, 2));
		console.log("Done!");
	} catch (error) {
		console.error("Script failed:", error);
	}
}

main();
