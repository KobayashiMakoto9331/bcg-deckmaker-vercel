import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ADMIN_KEY =
	process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_CARDS_BUCKET = process.env.SUPABASE_CARDS_BUCKET ?? "gcg-data";

export type AppUserRow = {
	id: string;
	name: string;
	is_read_only: boolean;
	created_at: string;
	updated_at: string;
};

export type DeckRow = {
	id: string;
	name: string;
	owner_id: string | null;
	is_public: boolean;
	cards: Record<string, number>;
	icon_cards: string[];
	created_at: string;
	updated_at: string;
};

export function isSupabaseConfigured() {
	return Boolean(SUPABASE_URL && SUPABASE_ADMIN_KEY);
}

export function getSupabaseAdmin() {
	if (!SUPABASE_URL || !SUPABASE_ADMIN_KEY) {
		throw new Error(
			"SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured.",
		);
	}

	return createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}

export function getSupabaseCardsBucket() {
	return SUPABASE_CARDS_BUCKET;
}

export function getDisplayLength(str: string) {
	let length = 0;
	for (let i = 0; i < str.length; i++) {
		const c = str.charCodeAt(i);
		if ((c >= 0x20 && c <= 0x7e) || (c >= 0xff61 && c <= 0xff9f)) {
			length += 1;
		} else {
			length += 2;
		}
	}
	return length;
}

export function toLegacyDeck(deck: DeckRow) {
	return {
		id: deck.id,
		name: deck.name,
		ownerId: deck.is_public ? "public" : deck.owner_id,
		cards: deck.cards ?? {},
		iconCards: deck.icon_cards ?? [],
		createdAt: Date.parse(deck.created_at),
		updatedAt: Date.parse(deck.updated_at),
	};
}

export function toLegacyUser(user: AppUserRow) {
	return {
		id: user.id,
		name: user.name,
		isReadOnly: user.is_read_only,
	};
}

export async function loadInitialJson<T>(path: string, fallback: T): Promise<T> {
	try {
		const res = await fetch(path);
		if (!res.ok) return fallback;
		return (await res.json()) as T;
	} catch {
		return fallback;
	}
}

export function uniqueDeckName(baseName: string, existingNames: string[]) {
	let newName = baseName;
	let counter = 2;
	while (existingNames.includes(newName)) {
		newName = `${baseName}（${counter}）`;
		counter++;
	}
	if (getDisplayLength(newName) > 40) {
		throw new Error(
			"既に同名のデッキが存在します。自動で番号付与を試みましたが、デッキ名上限を超えるためキャンセルします。デッキ名上限は全角20文字分です。",
		);
	}
	return newName;
}
