import axios from "axios";
import {
	inferMimeType,
	type ScrapedCard,
	scrapeCards,
} from "@/app/api/_shared/card-scraper";
import {
	getSupabaseAdmin,
	getSupabaseCardImagesBucket,
	getSupabaseCardsBucket,
	isSupabaseConfigured,
} from "@/app/api/_shared/supabase";

export const maxDuration = 300;
const IMAGE_PREFIX = "cards";

function sanitizeFileBase(value: string) {
	return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function inferExtension(url: string, contentType?: string) {
	if (contentType) {
		if (contentType.includes("webp")) return "webp";
		if (contentType.includes("png")) return "png";
		if (contentType.includes("gif")) return "gif";
		if (contentType.includes("svg")) return "svg";
		if (contentType.includes("jpeg") || contentType.includes("jpg"))
			return "jpg";
	}
	try {
		const pathname = new URL(url).pathname.toLowerCase();
		const match = pathname.match(/\.([a-z0-9]+)$/);
		if (match?.[1]) return match[1];
	} catch {
		// Ignore URL parse errors and fall back to generic extension.
	}
	return "img";
}

function isAlreadySupabaseImage(url: string, baseUrl: string) {
	return url.startsWith(`${baseUrl}/storage/v1/object/public/`);
}

async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T, index: number) => Promise<R>,
) {
	const results: R[] = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (cursor < items.length) {
			const idx = cursor++;
			results[idx] = await fn(items[idx], idx);
		}
	}
	await Promise.all(Array.from({ length: concurrency }, () => worker()));
	return results;
}

async function listExistingImageNames(
	supabase: ReturnType<typeof getSupabaseAdmin>,
	bucket: string,
) {
	const names = new Set<string>();
	const pageSize = 100;
	let offset = 0;
	while (true) {
		const { data, error } = await supabase.storage
			.from(bucket)
			.list(IMAGE_PREFIX, {
				limit: pageSize,
				offset,
			});
		if (error) throw error;
		if (!data || data.length === 0) break;
		for (const item of data) {
			if (item.name) names.add(item.name);
		}
		if (data.length < pageSize) break;
		offset += pageSize;
	}
	return names;
}

async function uploadCardImagesAndRewriteUrls(
	supabase: ReturnType<typeof getSupabaseAdmin>,
	imageBucket: string,
	cards: ScrapedCard[],
) {
	const {
		data: { publicUrl: bucketBaseUrl },
	} = supabase.storage.from(imageBucket).getPublicUrl("__probe__");
	const basePublicDir = bucketBaseUrl.replace(/\/__probe__$/, "");
	const existingNames = await listExistingImageNames(supabase, imageBucket);
	const uploadedNames = new Set<string>();
	let uploadedCount = 0;
	let reusedCount = 0;
	let failedCount = 0;

	const normalizedCards = await mapWithConcurrency(cards, 6, async (card) => {
		if (!card.image) return card;
		if (isAlreadySupabaseImage(card.image, basePublicDir)) {
			reusedCount += 1;
			return card;
		}
		const baseName = sanitizeFileBase(card.id);
		if (!baseName) {
			failedCount += 1;
			return card;
		}
		const finalNameFromExisting =
			Array.from(existingNames).find((name) =>
				name.startsWith(`${baseName}.`),
			) || null;
		if (finalNameFromExisting) {
			reusedCount += 1;
			return {
				...card,
				image: `${basePublicDir}/${IMAGE_PREFIX}/${finalNameFromExisting}`,
			};
		}
		try {
			const imageRes = await axios.get<ArrayBuffer>(card.image, {
				responseType: "arraybuffer",
				timeout: 30_000,
			});
			const headerContentType =
				typeof imageRes.headers["content-type"] === "string"
					? imageRes.headers["content-type"]
					: undefined;
			const contentType = inferMimeType(card.image, headerContentType);
			const extension = inferExtension(card.image, headerContentType);
			const fileName = `${baseName}.${extension}`;
			const objectPath = `${IMAGE_PREFIX}/${fileName}`;
			if (existingNames.has(fileName) || uploadedNames.has(fileName)) {
				reusedCount += 1;
				return { ...card, image: `${basePublicDir}/${objectPath}` };
			}
			const { error } = await supabase.storage
				.from(imageBucket)
				.upload(objectPath, Buffer.from(imageRes.data), {
					contentType,
					upsert: false,
				});
			if (error) throw error;
			existingNames.add(fileName);
			uploadedNames.add(fileName);
			uploadedCount += 1;
			return { ...card, image: `${basePublicDir}/${objectPath}` };
		} catch {
			failedCount += 1;
			return card;
		}
	});

	return {
		cards: normalizedCards,
		uploadedCount,
		reusedCount,
		failedCount,
	};
}

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
		const cardsBucket = getSupabaseCardsBucket();
		const imageBucket = getSupabaseCardImagesBucket();
		const imageSync = await uploadCardImagesAndRewriteUrls(
			supabase,
			imageBucket,
			cards,
		);

		const cardsJson = JSON.stringify(imageSync.cards);

		const uploadCards = await supabase.storage
			.from(cardsBucket)
			.upload("cards.json", cardsJson, {
				contentType: "application/json; charset=utf-8",
				upsert: true,
			});
		if (uploadCards.error) throw uploadCards.error;

		const elapsedMs = Date.now() - startedAt;
		return Response.json({
			ok: true,
			idsCount,
			cardsCount: imageSync.cards.length,
			cardsBytes: Buffer.byteLength(cardsJson, "utf-8"),
			cardsBucket,
			imageBucket,
			imageUploaded: imageSync.uploadedCount,
			imageReused: imageSync.reusedCount,
			imageFailed: imageSync.failedCount,
			elapsedMs,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Scrape job failed.";
		return Response.json({ error: message }, { status: 500 });
	}
}
