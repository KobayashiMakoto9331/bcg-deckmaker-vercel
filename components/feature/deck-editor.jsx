import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import {
	createToaster,
	Toaster,
	ToastRoot,
	ToastTitle,
} from "@/components/ui/toast/toast";
import filterConfig from "@/legacy/data/filterConfig.json";
import { useDebounceClick } from "@/legacy/hooks/useDebounceClick";
import { getDisplayLength } from "@/legacy/utils/storage";
import CardGrid from "./card-grid";
import DeckDetailModal from "./deck-detail-modal";
import DeckSidebar from "./deck-sidebar";
import PlayScreen from "./play-screen";

const toaster = createToaster({
	placement: "bottom",
	duration: 1000,
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

	const deckCardsRef = useRef(deckCards);
	useEffect(() => {
		deckCardsRef.current = deckCards;
	}, [deckCards]);

	const handleSetCount = useCallback((card, count) => {
		const currentDeck = deckCardsRef.current;
		const isRestrictedName =
			filterConfig.deckConstruction?.restrictedNames?.includes(card.name);
		const cardType = card.stats?.タイプ;
		const isRestrictedType =
			cardType &&
			filterConfig.deckConstruction?.restrictedTypes?.includes(cardType);
		if ((isRestrictedName || isRestrictedType) && count > 0) {
			toaster.create({
				title: "デッキに入れられないカードです",
				type: "error",
			});
			return;
		}

		const totalCards = Object.values(currentDeck).reduce((a, b) => a + b, 0);
		const currentCount = currentDeck[card.id] || 0;
		if (totalCards - currentCount + count > 99) {
			toaster.create({
				title: "デッキ枚数が上限(99)です",
				type: "error",
			});
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
				toaster.create({
					title: "カード枚数が上限(4)です",
					type: "error",
				});
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
	}, []);

	const handleAddCard = useCallback((card) => {
		const currentDeck = deckCardsRef.current;
		const isRestrictedName =
			filterConfig.deckConstruction?.restrictedNames?.includes(card.name);
		const cardType = card.stats?.タイプ;
		const isRestrictedType =
			cardType &&
			filterConfig.deckConstruction?.restrictedTypes?.includes(cardType);
		if (isRestrictedName || isRestrictedType) {
			toaster.create({
				title: "デッキに入れられないカードです",
				type: "error",
			});
			return;
		}
		const targetBaseId = card.id.substring(0, 8);
		let sameNameCount = 0;
		Object.entries(currentDeck).forEach(([id, count]) => {
			if (id.substring(0, 8) === targetBaseId) sameNameCount += count;
		});
		const totalCards = Object.values(currentDeck).reduce((a, b) => a + b, 0);
		if (totalCards >= 99) {
			toaster.create({
				title: "デッキ枚数が上限(99)です",
				type: "error",
			});
			return;
		}
		if (sameNameCount >= 4) {
			toaster.create({
				title: "カード枚数が上限(4)です",
				type: "error",
			});
			return;
		}
		const currentCount = currentDeck[card.id] || 0;
		setDeckCards({ ...currentDeck, [card.id]: currentCount + 1 });
		setIconCards((prevIcons) => {
			if (prevIcons.length < 2 && !prevIcons.includes(card.id))
				return [...prevIcons, card.id];
			return prevIcons;
		});
	}, []);

	const handleRemoveCard = useCallback((cardId) => {
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
	}, []);

	const handleSave = () => {
		if (!deckName.trim()) return alert("Deck name cannot be empty");
		if (getDisplayLength(deckName) > 40)
			return alert("デッキ名上限は全角20文字分です。");
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
			if (getDisplayLength(newName) > 40)
				return alert(
					"既に同名のデッキが存在します。自動で番号付与を試みましたが、デッキ名上限を超えるためキャンセルします。デッキ名上限は全角20文字分です。",
				);
			setDeckName(newName);
			return onSave({
				id: deck.id,
				name: newName,
				cards: deckCards,
				wasRenamed: true,
			});
		}
		onSave({ id: deck.id, name: deckName, cards: deckCards, iconCards });
	};

	const debouncedSave = useDebounceClick(handleSave);
	const debouncedClose = useDebounceClick(onClose);

	const handlePlay = useCallback(() => {
		const totalCards = Object.values(deckCardsRef.current).reduce(
			(a, b) => a + b,
			0,
		);
		if (totalCards <= 10) {
			toaster.create({
				title: "デッキ枚数不足",
				type: "error",
			});
			return;
		}
		setIsPlaying(true);
	}, []);

	return (
		<div className="DeckEditor deck-editor-root flex h-screen min-h-dvh flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-y-auto">
			<div className="feature-panel deck-editor-toolbar flex items-center justify-between gap-4 border-b border-primary/22 px-8 py-2">
				<div className="deck-editor-toolbar-inner flex items-top gap-3">
					<Button onClick={debouncedClose}>&lt;Back</Button>
					<div className="w-full max-w-[300px]">
						<Input
							value={deckName}
							onChange={(e) => setDeckName(e.target.value)}
						/>
					</div>
					<Button onClick={debouncedSave}>Save</Button>
					<Button onClick={handlePlay}>Play</Button>
					<Button onClick={() => setIsFilterOpen(true)}>Filter</Button>
				</div>
			</div>
			<div className="deck-editor-main flex flex-1 min-h-0 flex-row overflow-hidden max-[640px]:flex-col max-[640px]:overflow-visible">
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
					<ToastRoot key={toast.id}>
						<ToastTitle>{toast.title}</ToastTitle>
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
