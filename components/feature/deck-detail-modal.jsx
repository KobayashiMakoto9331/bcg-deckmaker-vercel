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
	const [showIconModal, setShowIconModal] = useState(false);
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
								<div className="flex gap-2">
									{!readOnly && onSetIconCards && (
										<Button onClick={() => setShowIconModal(true)}>
											Set Icon
										</Button>
									)}
								</div>
							</div>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
								{deckList.map((card) => (
									<div
										key={card.id}
										className="feature-card flex items-center gap-4 p-2 rounded"
									>
										<div
											onClick={() => setPreviewCard(card)}
											className="w-[50px] h-[50px] cursor-pointer relative flex-shrink-0"
										>
											<Image
												src={card.image}
												alt={card.name}
												width={50}
												height={50}
												className="object-contain"
											/>
										</div>
										<div className="flex-1 min-w-0 text-left">
											<div className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
												{card.name}
											</div>
											<div className="text-xs text-[#aaa]">{card.id}</div>
										</div>
										{readOnly ? (
											<span className="font-bold text-lg">x{card.count}</span>
										) : (
											<div className="flex items-center gap-1">
												<Button
													onClick={() => onRemove(card.id)}
													className="w-6! h-6! p-0!"
												>
													-
												</Button>
												<span className="font-bold w-5 text-center">
													{card.count}
												</span>
												<Button
													onClick={() => onAdd(card)}
													className="w-6! h-6! p-0!"
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
			{showIconModal && (
				<IconSettingModal
					open={showIconModal}
					onOpenChange={(details) => {
						if (!details.open) setShowIconModal(false);
					}}
					deckList={deckList}
					iconCards={iconCards}
					onSetIconCards={onSetIconCards}
				/>
			)}
		</>
	);
};

const IconSettingModal = ({
	open,
	onOpenChange,
	deckList,
	iconCards,
	onSetIconCards,
}) => {
	const [selectedIcons, setSelectedIcons] = useState([...iconCards]);
	const handleCardClick = (cardId) => {
		if (selectedIcons.includes(cardId))
			setSelectedIcons((prev) => prev.filter((id) => id !== cardId));
		else if (selectedIcons.length < 2)
			setSelectedIcons((prev) => [...prev, cardId]);
		else setSelectedIcons((prev) => [prev[1], cardId]);
	};

	return (
		<DialogRoot open={open} onOpenChange={onOpenChange}>
			<Portal>
				<DialogBackdrop />
				<DialogPositioner className="fixed inset-0 z-1200 flex items-center justify-center p-8">
					<DialogContent className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
						<DialogCloseTrigger />
						<div className="flex justify-between items-center mb-4">
							<DialogTitle>
								Set Deck Icons ({selectedIcons.length}/2)
							</DialogTitle>
							<div className="flex gap-2">
								<Button
									onClick={() => {
										onSetIconCards(selectedIcons);
										onOpenChange({ open: false });
									}}
								>
									Save
								</Button>
							</div>
						</div>
						<div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
							{deckList.map((card) => (
								<div
									key={card.id}
									onClick={() => handleCardClick(card.id)}
									className="cursor-pointer text-center"
								>
									<div
										className={`w-[100px] h-[100px] rounded-full mx-auto relative ${
											selectedIcons.includes(card.id)
												? "ring-[3px] ring-[#646cff]"
												: "ring-[3px] ring-transparent"
										}`}
									>
										<Image
											src={card.image}
											alt={card.name}
											width={100}
											height={100}
											className="rounded-full object-cover object-top scale-150"
										/>
									</div>
								</div>
							))}
						</div>
					</DialogContent>
				</DialogPositioner>
			</Portal>
		</DialogRoot>
	);
};

export default DeckDetailModal;
