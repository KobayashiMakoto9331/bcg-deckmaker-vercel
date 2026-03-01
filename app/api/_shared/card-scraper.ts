import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.gundam-gcg.com/jp/cards/";
const LIST_URL_TEMPLATE = "https://www.gundam-gcg.com/jp/cards/index.php?package=";
const DETAIL_URL_TEMPLATE =
	"https://www.gundam-gcg.com/jp/cards/detail.php?detailSearch=";

export type ScrapedCard = {
	id: string;
	name: string;
	rarity: string;
	image: string;
	stats: Record<string, string>;
	text: string;
	q_and_a: Array<{ q: string; a: string }>;
};

async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T, index: number) => Promise<R>,
) {
	const results: R[] = new Array(items.length);
	let current = 0;

	async function worker() {
		while (current < items.length) {
			const idx = current++;
			results[idx] = await fn(items[idx], idx);
		}
	}

	await Promise.all(Array.from({ length: concurrency }, () => worker()));
	return results;
}

export async function collectPackageIds() {
	const packageIds = new Set<string>();

	const { data } = await axios.get(BASE_URL, { timeout: 20_000 });
	const $ = cheerio.load(data);

	$(".js-selectBtn-package").each((_, el) => {
		const val = ($(el).attr("data-val") || "").trim();
		if (val) packageIds.add(val);
	});

	// Keep a fallback package for resilience.
	if (packageIds.size === 0) packageIds.add("615103");

	return Array.from(packageIds);
}

export async function collectCardIds(packageIds?: string[]) {
	const cardIds = new Set<string>();
	const targetPackageIds = packageIds ?? (await collectPackageIds());

	for (const packageId of targetPackageIds) {
		const { data: listData } = await axios.get(`${LIST_URL_TEMPLATE}${packageId}`, {
			timeout: 20_000,
		});
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

export async function scrapeCards() {
	const packageIds = await collectPackageIds();
	const ids = await collectCardIds(packageIds);
	const results = await mapWithConcurrency(ids, 8, async (id) => {
		try {
			const { data } = await axios.get(`${DETAIL_URL_TEMPLATE}${id}`, {
				timeout: 20_000,
			});
			const $ = cheerio.load(data);
			const imageSrc = $(".cardImage img").attr("src");

			const card: ScrapedCard = {
				id,
				name: $(".cardName").text().trim(),
				rarity: $(".rarity").text().trim(),
				image: imageSrc
					? imageSrc.startsWith("http")
						? imageSrc
						: new URL(imageSrc, "https://www.gundam-gcg.com/jp/cards/").href
					: "",
				stats: {},
				text: $(".overview .dataTxt").text().trim(),
				q_and_a: [],
			};

			$(".dataTit").each((_, el) => {
				const key = $(el)
					.text()
					.trim()
					.replace(/[:：]/g, "");
				const val = $(el).next().text().trim();
				if (key) card.stats[key] = val;
			});

			$(".cardQaCol dl").each((_, dl) => {
				const q = $(dl).find("dt").text().trim();
				const a = $(dl).find("dd").text().trim();
				if (q) card.q_and_a.push({ q, a });
			});

			return card;
		} catch {
			return null;
		}
	});

	const cards = results.filter((card): card is ScrapedCard => card !== null);
	return { idsCount: ids.length, cards };
}

export function inferMimeType(url: string, contentType?: string) {
	if (contentType?.startsWith("image/")) return contentType;
	const lower = url.toLowerCase();
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".gif")) return "image/gif";
	if (lower.endsWith(".svg")) return "image/svg+xml";
	return "image/jpeg";
}

export async function toPackedCards(cards: ScrapedCard[]) {
	const converted = await mapWithConcurrency(cards, 8, async (card) => {
		if (!card.image || card.image.startsWith("data:image/")) return card;
		try {
			const res = await axios.get<ArrayBuffer>(card.image, {
				responseType: "arraybuffer",
				timeout: 30_000,
			});
			const mimeType = inferMimeType(
				card.image,
				typeof res.headers["content-type"] === "string"
					? res.headers["content-type"]
					: undefined,
			);
			const base64 = Buffer.from(res.data).toString("base64");
			return { ...card, image: `data:${mimeType};base64,${base64}` };
		} catch {
			return card;
		}
	});

	return converted;
}
