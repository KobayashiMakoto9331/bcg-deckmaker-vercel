import { generateId } from "./idGenerator";

export const STORAGE_KEY_DECKS = "gcg_decks";
export const STORAGE_KEY_USERS = "gcg_users";

const DEFAULT_USERS = [{ id: "public", name: "Public", isReadOnly: true }];
const DEFAULT_DECKS = [];

// Initialize data from public JSON files if localStorage is empty.
const initializeStorage = async () => {
	try {
		if (!localStorage.getItem(STORAGE_KEY_DECKS)) {
			try {
				const res = await fetch("/initial_decks.json");
				if (res.ok) {
					const decks = await res.json();
					localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
				} else {
					localStorage.setItem(
						STORAGE_KEY_DECKS,
						JSON.stringify(DEFAULT_DECKS),
					);
				}
			} catch {
				localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(DEFAULT_DECKS));
			}
		}

		if (!localStorage.getItem(STORAGE_KEY_USERS)) {
			try {
				const res = await fetch("/initial_users.json");
				if (res.ok) {
					const users = await res.json();
					localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
				} else {
					localStorage.setItem(
						STORAGE_KEY_USERS,
						JSON.stringify(DEFAULT_USERS),
					);
				}
			} catch {
				localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
			}
		}
	} catch (e) {
		console.error("Failed to initialize storage", e);
	}
};

export const getDecks = async () => {
	try {
		await initializeStorage();
		const stored = localStorage.getItem(STORAGE_KEY_DECKS);
		if (!stored) return [];
		const decks = JSON.parse(stored);
		return decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
	} catch (e) {
		console.error("Failed to load decks", e);
		return [];
	}
};

export const getDisplayLength = (str) => {
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
};

export const saveDeckToStorage = async (deckData) => {
	const decks = await getDecks();
	const index = decks.findIndex((d) => d.id === deckData.id);

	if (index >= 0) {
		decks[index] = { ...decks[index], ...deckData, updatedAt: Date.now() };
	} else {
		decks.push({ ...deckData, createdAt: Date.now(), updatedAt: Date.now() });
	}

	decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
	return decks;
};

export const deleteDeckFromStorage = async (deckId) => {
	const decks = await getDecks();
	const newDecks = decks.filter((d) => d.id !== deckId);
	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(newDecks));
	return newDecks;
};

export const copyDeckInStorage = async (deckId) => {
	const decks = await getDecks();
	const sourceDeck = decks.find((d) => d.id === deckId);
	if (!sourceDeck) return decks;

	const baseName = `${sourceDeck.name} COPY`;
	let newName = baseName;
	let counter = 2;

	while (decks.some((d) => d.name === newName)) {
		newName = `${baseName}（${counter}）`;
		counter++;
	}

	if (getDisplayLength(newName) > 40) {
		throw new Error(
			"既に同名のデッキが存在します。自動で番号付与を試みましたが、デッキ名上限を超えるためキャンセルします。デッキ名上限は全角20文字分です。",
		);
	}

	const newDeck = {
		...sourceDeck,
		id: generateId(),
		name: newName,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
	decks.push(newDeck);
	decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
	return decks;
};

export const renameDeckInStorage = async (deckId, newName) => {
	const decks = await getDecks();
	const deck = decks.find((d) => d.id === deckId);
	if (deck) {
		deck.name = newName;
		deck.updatedAt = Date.now();
		decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
		localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
	}
	return decks;
};

export const getUsers = async () => {
	try {
		await initializeStorage();
		const stored = localStorage.getItem(STORAGE_KEY_USERS);
		if (!stored) return DEFAULT_USERS;
		return JSON.parse(stored);
	} catch (e) {
		console.error("Failed to load users", e);
		return DEFAULT_USERS;
	}
};

export const saveUser = async (user) => {
	const users = await getUsers();
	if (users.some((u) => u.name === user.name && u.id !== user.id)) {
		throw new Error("同名のユーザーが既に存在します。");
	}

	const idx = users.findIndex((u) => u.id === user.id);
	if (idx >= 0) {
		if (users[idx].isReadOnly)
			throw new Error("このユーザーは変更できません。");
		users[idx] = { ...users[idx], ...user };
	} else {
		users.push(user);
	}

	localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
	return users;
};

export const deleteUser = async (userId) => {
	const users = await getUsers();
	const user = users.find((u) => u.id === userId);
	if (user?.isReadOnly) throw new Error("このユーザーは削除できません。");

	const newUsers = users.filter((u) => u.id !== userId);
	localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(newUsers));

	const decks = await getDecks();
	const newDecks = decks.filter((d) => d.ownerId !== userId);
	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(newDecks));

	return newUsers;
};

const generateUniqueName = (baseName, existingDecks) => {
	let newName = baseName;
	let counter = 2;
	while (existingDecks.some((d) => d.name === newName)) {
		newName = `${baseName}（${counter}）`;
		counter++;
	}
	if (getDisplayLength(newName) > 40) {
		throw new Error(
			"既に同名のデッキが存在します。自動で番号付与を試みましたが、デッキ名上限を超えるためキャンセルします。デッキ名上限は全角20文字分です。",
		);
	}
	return newName;
};

export const exportDeckToPublic = async (deckId) => {
	const decks = await getDecks();
	const deck = decks.find((d) => d.id === deckId);
	if (!deck) return decks;

	const publicDecks = decks.filter((d) => (d.ownerId || "public") === "public");
	const newName = generateUniqueName(deck.name, publicDecks);

	const newDeck = {
		...deck,
		id: generateId(),
		ownerId: "public",
		name: newName,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
	decks.push(newDeck);
	decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
	return decks;
};

export const importDeckFromPublic = async (deckId, targetUserId) => {
	const decks = await getDecks();
	const deck = decks.find((d) => d.id === deckId);
	if (!deck) return decks;

	const userDecks = decks.filter((d) => d.ownerId === targetUserId);
	const newName = generateUniqueName(deck.name, userDecks);

	const newDeck = {
		...deck,
		id: generateId(),
		ownerId: targetUserId,
		name: newName,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
	decks.push(newDeck);
	decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

	localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
	return decks;
};
