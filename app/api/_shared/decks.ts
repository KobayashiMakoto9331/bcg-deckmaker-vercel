import { randomUUID } from "node:crypto";
import {
	getDisplayLength,
	getSupabaseAdmin,
	toLegacyDeck,
	uniqueDeckName,
	type DeckRow,
} from "./supabase";

export async function fetchDeckRows() {
	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase
		.from("decks")
		.select("*")
		.order("updated_at", { ascending: false });
	if (error) throw error;
	return data as DeckRow[];
}

export async function fetchLegacyDecks() {
	const rows = await fetchDeckRows();
	return rows.map(toLegacyDeck);
}

export function generateDeckId() {
	return randomUUID();
}

export function assertDeckNameWithinLimit(name: string) {
	if (getDisplayLength(name) > 40) {
		throw new Error("デッキ名上限は全角20文字分です。");
	}
}

export function createUniqueDeckName(
	baseName: string,
	existingDeckNames: string[],
) {
	return uniqueDeckName(baseName, existingDeckNames);
}
