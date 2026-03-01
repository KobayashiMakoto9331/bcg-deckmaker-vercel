import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button";
import CardPreviewModal from "./card-preview-modal";

const PlayScreen = ({ deck, cards, onClose }) => {
	const [library, setLibrary] = useState([]);
	const [shield, setShield] = useState([]);
	const [hand, setHand] = useState([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [previewCard, setPreviewCard] = useState(null);
	const [isShieldVisible, setIsShieldVisible] = useState(true);

	const cardsMap = React.useMemo(() => {
		const map = {};
		if (cards)
			cards.forEach((c) => {
				map[c.id] = c;
			});
		return map;
	}, [cards]);

	const initializeGame = useCallback(() => {
		const deckList = [];
		Object.entries(deck).forEach(([id, count]) => {
			for (let i = 0; i < count; i++) deckList.push(id);
		});
		for (let i = deckList.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deckList[i], deckList[j]] = [deckList[j], deckList[i]];
		}
		setShield(deckList.slice(0, 6));
		setHand(deckList.slice(6, 11));
		setLibrary(deckList.slice(11));
		setIsInitialized(true);
	}, [deck]);

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	const shieldEntries = React.useMemo(() => {
		const seen = {};
		return shield.map((cardId) => {
			seen[cardId] = (seen[cardId] || 0) + 1;
			return { cardId, key: `${cardId}-${seen[cardId]}` };
		});
	}, [shield]);

	const handEntries = React.useMemo(() => {
		const seen = {};
		return hand.map((cardId) => {
			seen[cardId] = (seen[cardId] || 0) + 1;
			return { cardId, key: `${cardId}-${seen[cardId]}` };
		});
	}, [hand]);

	if (!isInitialized) return <div className="text-white">Initializing...</div>;

	return (
		<div className="fixed inset-0 z-3000 flex flex-col overflow-hidden bg-(--color-background) [background-image:var(--app-bg)] px-16 py-4 text-white">
			<div className="shrink-0">
				<div className="mb-2 flex w-full items-center gap-4">
					<h3 className="m-0 p-0 text-left text-white">
						Shield ({shield.length})
					</h3>
					<input
						type="checkbox"
						checked={isShieldVisible}
						onChange={(e) => setIsShieldVisible(e.target.checked)}
						className="h-[1.2rem] w-[1.2rem] cursor-pointer"
					/>
					<div className="ml-auto flex items-center gap-4">
						<Button onClick={onClose}>Close</Button>
						<Button onClick={initializeGame}>Reset</Button>
						<span className="text-[0.9rem] text-[#aaa]">
							Deck: {library.length}
						</span>
						{library.length > 0 && (
							<Button
								onClick={() => {
									const card = library[0];
									setLibrary((prev) => prev.slice(1));
									setHand((prev) => [...prev, card]);
								}}
							>
								Draw
							</Button>
						)}
					</div>
				</div>
				{isShieldVisible && (
					<div className="flex min-h-[120px] gap-2 overflow-x-auto">
						{shieldEntries.map(({ cardId, key }) => (
							<CardView
								key={`shield-${key}`}
								card={cardsMap[cardId]}
								onInfoClick={setPreviewCard}
							/>
						))}
					</div>
				)}
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<h3 className="m-0 w-full p-0 text-left text-white">
					Hand ({hand.length})
				</h3>
				<div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto py-2">
					{handEntries.map(({ cardId, key }) => (
						<CardView
							key={`hand-${key}`}
							card={cardsMap[cardId]}
							onInfoClick={setPreviewCard}
						/>
					))}
				</div>
			</div>
			{previewCard && (
				<CardPreviewModal
					card={previewCard}
					onClose={() => setPreviewCard(null)}
				/>
			)}
		</div>
	);
};

const CardView = ({ card, onInfoClick }) => {
	if (!card)
		return (
			<div className="flex h-[98px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-dashed border-[#666] bg-[#333] text-[0.8rem] text-[#666]">
				?
			</div>
		);
	return (
		<div className="relative h-[98px] w-[70px] shrink-0 overflow-hidden rounded-lg border border-[#444] bg-black">
			<Button
				onClick={(e) => {
					e.stopPropagation();
					onInfoClick?.(card);
				}}
				className="!absolute !right-0.5 !top-0.5 z-10 !mb-0 !h-[18px] !w-[18px] !rounded-full !p-0"
			>
				i
			</Button>
			<Image
				src={card.image}
				alt={card.name}
				fill
				unoptimized
				sizes="70px"
				className="h-full w-full object-contain"
				onError={(e) => {
					e.currentTarget.style.display = "none";
				}}
			/>
		</div>
	);
};

export default PlayScreen;
