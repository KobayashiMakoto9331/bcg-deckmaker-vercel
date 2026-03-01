import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import {
	createToaster,
	Toaster,
	ToastRoot,
	ToastTitle,
} from "@/components/ui/toast/toast";
import filterConfig from "@/legacy/data/filterConfig.json";
import { getDisplayLength } from "@/legacy/utils/storage";
import CardGrid from "./card-grid";
import DeckDetailModal from "./deck-detail-modal";
import DeckSidebar from "./deck-sidebar";
import PlayScreen from "./play-screen";

const toaster = createToaster({
	placement: "bottom",
	duration: 2000,
	max: 1,
});

const DeckEditor = ({ deck, cards, onSave, onClose, existingDeckNames }) => {
	const [deckCards, setDeckCards] = useState(deck.cards || {});
	const [iconCards, setIconCards] = useState(deck.iconCards || []);
	const [deckName, setDeckName] = useState(deck.name || "New Deck");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [sortKey, setSortKey] = useState("Lv.");
	const [sortDirection, setSortDirection] = useState("desc");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const showToast = (title, type = "default") => {
		toaster.create({ title, type, duration: 2000 });
	};

	const deckCardsRef = useRef(deckCards);
	useEffect(() => {
		deckCardsRef.current = deckCards;
	}, [deckCards]);

	const handleSetCount = (card, count) => {
		const currentDeck = deckCardsRef.current;
		const isRestrictedName =
			filterConfig.deckConstruction?.restrictedNames?.includes(card.name);
		const cardType = card.stats?.タイプ;
		const isRestrictedType =
			cardType &&
			filterConfig.deckConstruction?.restrictedTypes?.includes(cardType);
		if ((isRestrictedName || isRestrictedType) && count > 0) {
			showToast("デッキに入れられないカードです", "error");
			return;
		}

		const totalCards = Object.values(currentDeck).reduce((a, b) => a + b, 0);
		const currentCount = currentDeck[card.id] || 0;
		if (totalCards - currentCount + count > 99) {
			showToast("デッキ枚数が上限(99)です", "error");
			return;
		}

		if (count > 0) {
			const targetBaseId = card.id.substring(0, 8);
			let otherVariantsCount = 0;
			Object.entries(currentDeck).forEach(([id, c]) => {
				if (id !== card.id && id.substring(0, 8) === targetBaseId) {
					otherVariantsCount += c;
				}
			});
			if (otherVariantsCount + count > 4) {
				showToast("カード枚数が上限(4)です", "error");
				return;
			}
		}

		if (count <= 0) {
			const next = { ...currentDeck };
			delete next[card.id];
			setDeckCards(next);
			setIconCards((prevIcons) => prevIcons.filter((id) => id !== card.id));
		} else {
			setDeckCards({ ...currentDeck, [card.id]: count });
		}
	};

	const handleAddCard = (card) => {
		const currentDeck = deckCardsRef.current;
		const isRestrictedName =
			filterConfig.deckConstruction?.restrictedNames?.includes(card.name);
		const cardType = card.stats?.タイプ;
		const isRestrictedType =
			cardType &&
			filterConfig.deckConstruction?.restrictedTypes?.includes(cardType);
		if (isRestrictedName || isRestrictedType) {
			showToast("デッキに入れられないカードです", "error");
			return;
		}
		const targetBaseId = card.id.substring(0, 8);
		let sameNameCount = 0;
		Object.entries(currentDeck).forEach(([id, count]) => {
			if (id.substring(0, 8) === targetBaseId) sameNameCount += count;
		});
		const totalCards = Object.values(currentDeck).reduce((a, b) => a + b, 0);
		if (totalCards >= 99) {
			showToast("デッキ枚数が上限(99)です", "error");
			return;
		}
		if (sameNameCount >= 4) {
			showToast("カード枚数が上限(4)です", "error");
			return;
		}
		const currentCount = currentDeck[card.id] || 0;
		setDeckCards({ ...currentDeck, [card.id]: currentCount + 1 });
		setIconCards((prevIcons) => {
			if (prevIcons.length < 2 && !prevIcons.includes(card.id))
				return [...prevIcons, card.id];
			return prevIcons;
		});
	};

	const handleRemoveCard = (cardId) => {
		const currentDeck = deckCardsRef.current;
		const currentCount = currentDeck[cardId];
		if (!currentCount) return;
		if (currentCount <= 1) {
			const next = { ...currentDeck };
			delete next[cardId];
			setDeckCards(next);
			setIconCards((prevIcons) => prevIcons.filter((id) => id !== cardId));
		} else {
			setDeckCards({ ...currentDeck, [cardId]: currentCount - 1 });
		}
	};

	const handleSave = async () => {
		if (isSaving) return;
		if (!deckName.trim()) {
			showToast("デッキ名を入力してください。", "error");
			return;
		}
		if (getDisplayLength(deckName) > 40) {
			showToast("デッキ名上限は全角20文字分です。", "error");
			return;
		}
		const isDuplicate = existingDeckNames.some(
			(d) => d.name === deckName && d.id !== deck.id,
		);
		if (isDuplicate) {
			let newName = deckName;
			let counter = 2;
			while (true) {
				const candidate = `${deckName}（${counter}）`;
				const exists = existingDeckNames.some(
					(d) => d.name === candidate && d.id !== deck.id,
				);
				if (!exists) {
					newName = candidate;
					break;
				}
				counter++;
			}
			if (getDisplayLength(newName) > 40) {
				showToast(
					"既に同名のデッキが存在し、自動番号付与後にデッキ名上限を超えたため保存を中止しました。",
					"error",
				);
				return;
			}
			setDeckName(newName);
			setIsSaving(true);
			try {
				await onSave({
					id: deck.id,
					name: newName,
					cards: deckCards,
					wasRenamed: true,
				});
				showToast(`保存しました: ${newName}`, "success");
			} catch {
				showToast("保存に失敗しました", "error");
			} finally {
				setIsSaving(false);
			}
			return;
		}
		setIsSaving(true);
		try {
			await onSave({
				id: deck.id,
				name: deckName,
				cards: deckCards,
				iconCards,
			});
			showToast(`保存しました: ${deckName}`, "success");
		} catch {
			showToast("保存に失敗しました", "error");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePlay = () => {
		const totalCards = Object.values(deckCardsRef.current).reduce(
			(a, b) => a + b,
			0,
		);
		if (totalCards <= 10) {
			showToast("デッキ枚数不足", "error");
			return;
		}
		setIsPlaying(true);
	};

	return (
		<div className="DeckEditor deck-editor-root flex h-screen min-h-dvh flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible [@media(orientation:landscape)_and_(max-height:560px)]:h-auto [@media(orientation:landscape)_and_(max-height:560px)]:min-h-dvh [@media(orientation:landscape)_and_(max-height:560px)]:overflow-visible">
			<div className="deck-editor-toolbar flex items-center justify-between gap-4 border border-(--panel-border) border-b border-primary/22 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--panel-bg-soft)_85%,transparent)_0%,var(--panel-bg)_100%)] px-8 py-2 shadow-(--panel-glow) backdrop-blur-sm">
				<div className="deck-editor-toolbar-inner flex items-top gap-3">
					<Button onClick={onClose} variant="secondary">
						&lt;Back
					</Button>
					<div className="w-full max-w-[300px]">
						<Input
							value={deckName}
							onChange={(e) => setDeckName(e.target.value)}
						/>
					</div>
					<Button onClick={handlePlay}>Play</Button>
					<Button onClick={() => setIsFilterOpen(true)}>Filter</Button>
					<Button onClick={handleSave} variant="success" disabled={isSaving}>
						{isSaving ? "Saving..." : "Save"}
					</Button>
				</div>
			</div>
			<div className="deck-editor-main flex flex-1 min-h-0 flex-row overflow-visible max-[640px]:flex-col">
				<div className="min-w-0 flex-1 min-h-0 overflow-y-auto">
					<CardGrid
						cards={cards}
						deck={deckCards}
						onSetCount={handleSetCount}
						sortKey={sortKey}
						setSortKey={setSortKey}
						sortDirection={sortDirection}
						setSortDirection={setSortDirection}
						isFilterOpen={isFilterOpen}
						onCloseFilter={() => setIsFilterOpen(false)}
					/>
				</div>
				<DeckSidebar
					deck={deckCards}
					cards={cards}
					onRemove={handleRemoveCard}
					onClear={() => {
						if (window.confirm("Clear deck content?")) {
							setDeckCards({});
							setIconCards([]);
						}
					}}
					onAdd={handleAddCard}
					onOpenDetails={() => setIsModalOpen(true)}
					sortKey={sortKey}
					sortDirection={sortDirection}
				/>
			</div>
			<Toaster toaster={toaster}>
				{(toast) => (
					<ToastRoot key={toast.id} toastType={toast.type}>
						<ToastTitle toastType={toast.type}>{toast.title}</ToastTitle>
					</ToastRoot>
				)}
			</Toaster>
			<DeckDetailModal
				deck={deckCards}
				cards={cards}
				iconCards={iconCards}
				onSetIconCards={setIconCards}
				open={isModalOpen}
				onOpenChange={(details) => {
					if (!details.open) setIsModalOpen(false);
				}}
				onAdd={handleAddCard}
				onRemove={handleRemoveCard}
			/>
			{isPlaying && (
				<PlayScreen
					deck={deckCards}
					cards={cards}
					onClose={() => setIsPlaying(false)}
				/>
			)}
		</div>
	);
};

export default DeckEditor;
