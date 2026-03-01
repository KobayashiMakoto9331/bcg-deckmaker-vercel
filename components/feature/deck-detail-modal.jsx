"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import {
	DialogBackdrop,
	DialogCloseTrigger,
	DialogContent,
	DialogPositioner,
	DialogRoot,
	DialogTitle,
	Portal,
} from "@/components/ui/dialog/dialog";
import CardPreviewModal from "./card-preview-modal";

const DeckDetailModal = ({
	deck,
	cards,
	open,
	onOpenChange,
	onAdd,
	onRemove,
	readOnly = false,
	iconCards = [],
	onSetIconCards,
}) => {
	const [previewCard, setPreviewCard] = useState(null);

	const deckList = useMemo(() => {
		return Object.entries(deck || {})
			.map(([id, count]) => {
				const card = (cards || []).find((c) => c.id === id);
				if (!card) return null;
				return { ...card, count };
			})
			.filter(Boolean);
	}, [deck, cards]);

	const toggleIconCard = (cardId) => {
		if (!onSetIconCards) return;
		const isSelected = iconCards.includes(cardId);
		if (isSelected) {
			onSetIconCards(iconCards.filter((id) => id !== cardId));
			return;
		}
		if (iconCards.length < 2) {
			onSetIconCards([...iconCards, cardId]);
			return;
		}
		onSetIconCards([iconCards[1], cardId]);
	};

	return (
		<>
			<DialogRoot open={open} onOpenChange={onOpenChange}>
				<Portal>
					<DialogBackdrop />
					<DialogPositioner className="fixed inset-0 z-1000 flex items-center justify-center p-8">
						<DialogContent className="w-full max-w-[900px] max-h-[90vh] overflow-y-auto">
							<DialogCloseTrigger />
							<div className="flex justify-between items-center mb-4">
								<DialogTitle>Deck Details</DialogTitle>
								<div className="text-xs text-[#aaa]">
									{!readOnly && onSetIconCards
										? `Icon: ${iconCards.length}/2`
										: ""}
								</div>
							</div>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
								{deckList.map((card) => (
									<div
										key={card.id}
										className="feature-card flex items-center gap-4 p-2 rounded"
									>
										<button
											type="button"
											onClick={() => setPreviewCard(card)}
											className="relative h-[50px] w-[50px] shrink-0 cursor-pointer overflow-hidden rounded"
										>
											<Image
												src={card.image}
												alt={card.name}
												fill
												sizes="50px"
												className="object-cover object-top"
											/>
										</button>
										<div className="flex-1 min-w-0 text-left">
											<div className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
												{card.name}
											</div>
											<div className="text-xs text-[#aaa]">{card.id}</div>
										</div>
										{readOnly ? (
											<span className="font-bold text-lg">x{card.count}</span>
										) : (
											<div className="flex items-center gap-2">
												{onSetIconCards && (
													<Button
														onClick={(e) => {
															e.stopPropagation();
															toggleIconCard(card.id);
														}}
														selected={iconCards.includes(card.id)}
														className="h-8 min-w-[64px] px-2 text-xs"
													>
														Icon
													</Button>
												)}
												<Button
													onClick={() => onRemove(card.id)}
													className="w-8! h-8! p-0!"
												>
													-
												</Button>
												<span className="font-bold w-6 text-center">
													{card.count}
												</span>
												<Button
													onClick={() => onAdd(card)}
													className="w-8! h-8! p-0!"
												>
													+
												</Button>
											</div>
										)}
									</div>
								))}
							</div>
						</DialogContent>
					</DialogPositioner>
				</Portal>
			</DialogRoot>
			{previewCard && (
				<CardPreviewModal
					card={previewCard}
					open={!!previewCard}
					onOpenChange={(details) => {
						if (!details.open) setPreviewCard(null);
					}}
				/>
			)}
		</>
	);
};

export default DeckDetailModal;
