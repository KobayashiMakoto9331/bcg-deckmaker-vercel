import fs from "node:fs/promises";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.gundam-gcg.com/jp/cards/";
const LIST_URL_TEMPLATE =
	"https://www.gundam-gcg.com/jp/cards/index.php?package=";
const DETAIL_URL_TEMPLATE =
	"https://www.gundam-gcg.com/jp/cards/detail.php?detailSearch=";
const OUTPUT_JSON = "public/cards.json";

async function collectCardIds() {
	const packageIds = new Set();
	const cardIds = new Set();

	const { data } = await axios.get(BASE_URL);
	const $ = cheerio.load(data);

	$(".js-selectBtn-package").each((_, el) => {
		const val = ($(el).attr("data-val") || "").trim();
		if (val) packageIds.add(val);
	});

	// Fallback if package list cannot be parsed from HTML.
	if (packageIds.size === 0) {
		packageIds.add("615103");
	}

	for (const packageId of packageIds) {
		const { data: listData } = await axios.get(
			`${LIST_URL_TEMPLATE}${packageId}`,
		);
		const $$ = cheerio.load(listData);
		$$(".cardItem").each((_, el) => {
			const dataSrc = $$(el).find("a.cardStr").attr("data-src");
			if (!dataSrc) return;
			const match = dataSrc.match(/detailSearch=([^&]+)/);
			if (match) cardIds.add(match[1]);
		});
	}

	return Array.from(cardIds);
}

async function scrape() {
	console.log("Fetching main page...");

	let cardIds = [];
	try {
		cardIds = await collectCardIds();

		console.log(`Found ${cardIds.length} cards.`);
	} catch (err) {
		console.error("Error fetching main page:", err);
		return;
	}

	let existingCards = [];
	try {
		const raw = await fs.readFile(OUTPUT_JSON, "utf-8");
		existingCards = JSON.parse(raw);
	} catch {
		console.log("No existing public/cards.json found. Creating new one.");
	}

	const cardMap = new Map(existingCards.map((c) => [c.id, c]));
	const BATCH_SIZE = 10;
	let newCards = 0;
	let updatedCards = 0;

	for (let i = 0; i < cardIds.length; i += BATCH_SIZE) {
		const batch = cardIds.slice(i, i + BATCH_SIZE);
		console.log(
			`Processing batch ${i / BATCH_SIZE + 1} / ${Math.ceil(cardIds.length / BATCH_SIZE)}`,
		);

		const results = await Promise.all(
			batch.map(async (id) => {
				try {
					const url = `${DETAIL_URL_TEMPLATE}${id}`;
					const { data } = await axios.get(url);
					const $ = cheerio.load(data);

					const card = {
						id,
						name: $(".cardName").text().trim(),
						rarity: $(".rarity").text().trim(),
						image: $(".cardImage img").attr("src"),
						stats: {},
						text: $(".overview .dataTxt").text().trim(),
						q_and_a: [],
					};

					if (card.image && !card.image.startsWith("http")) {
						card.image = new URL(
							card.image,
							"https://www.gundam-gcg.com/jp/cards/",
						).href;
					}

					$(".dataTit").each((_, el) => {
						const key = $(el).text().trim().replace(/[:：]/g, "");
						const val = $(el).next().text().trim();
						if (key) card.stats[key] = val;
					});

					$(".cardQaCol dl").each((_, dl) => {
						const q = $(dl).find("dt").text().trim();
						const a = $(dl).find("dd").text().trim();
						if (q) card.q_and_a.push({ q, a });
					});

					return card;
				} catch (err) {
					console.error(`Failed to scrape card ${id}`, err.message);
					return null;
				}
			}),
		);

		for (const card of results) {
			if (!card) continue;
			const existing = cardMap.get(card.id);

			if (!existing) {
				newCards++;
				cardMap.set(card.id, card);
			} else {
				if (existing.image?.startsWith("/images/")) {
					card.image = existing.image;
				}

				if (JSON.stringify(existing) !== JSON.stringify(card)) {
					updatedCards++;
					cardMap.set(card.id, card);
				}
			}
		}

		await new Promise((r) => setTimeout(r, 200));
	}

	const finalCards = Array.from(cardMap.values());
	await fs.writeFile(OUTPUT_JSON, JSON.stringify(finalCards, null, 2));

	console.log("Scraping complete.");
	console.log(`New cards: ${newCards}`);
	console.log(`Updated cards: ${updatedCards}`);
	console.log(`Total cards: ${finalCards.length}`);
}

scrape();
