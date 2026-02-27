import Image from "next/image";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import CardPreviewModal from "./card-preview-modal";

const DeckSidebar = ({
	deck,
	cards,
	onRemove,
	onClear,
	onAdd,
	onOpenDetails,
	sortKey,
	sortDirection,
}) => {
	const effectiveRarityMap = useMemo(() => {
		const map = {};
		const nonPRarities = {};
		cards.forEach((c) => {
			const r = (c.rarity || "").replace(/[+\uff0b]/g, "").trim();
			if (r && r !== "P") {
				if (!nonPRarities[c.name]) nonPRarities[c.name] = new Set();
				nonPRarities[c.name].add(r);
			}
		});
		cards.forEach((c) => {
			let r = (c.rarity || "").replace(/[+\uff0b]/g, "").trim();
			if (r === "P") {
				const alternatives = nonPRarities[c.name];
				if (alternatives && alternatives.size > 0)
					r = Array.from(alternatives)[0];
			}
			map[c.id] = r;
		});
		return map;
	}, [cards]);

	const deckList = React.useMemo(() => {
		return Object.entries(deck || {})
			.map(([id, count]) => {
				const card = (cards || []).find((c) => c.id === id);
				if (!card) return null;
				return { ...card, count };
			})
			.filter(Boolean)
			.sort((a, b) => {
				let valA;
				let valB;
				if (sortKey === "ID") {
					valA = a.id;
					valB = b.id;
				} else if (sortKey === "Rarity") {
					const order = ["L", "LR", "SR", "R", "U", "C", "ST", "P"];
					const rA = effectiveRarityMap[a.id] || "";
					const rB = effectiveRarityMap[b.id] || "";
					const getScore = (r) => {
						const idx = order.indexOf(r);
						if (idx === -1) return -1;
						return 100 - idx;
					};
					valA = getScore(rA);
					valB = getScore(rB);
				} else {
					const isBad = (v) =>
						v === undefined ||
						v === null ||
						v === "-" ||
						Number.isNaN(Number(v));
					valA = isBad(a.stats?.[sortKey])
						? sortDirection === "asc"
							? 999999
							: -999999
						: Number(a.stats?.[sortKey]);
					valB = isBad(b.stats?.[sortKey])
						? sortDirection === "asc"
							? 999999
							: -999999
						: Number(b.stats?.[sortKey]);
				}
				if (valA < valB) return sortDirection === "asc" ? -1 : 1;
				if (valA > valB) return sortDirection === "asc" ? 1 : -1;
				return a.name.localeCompare(b.name);
			});
	}, [deck, cards, sortKey, sortDirection, effectiveRarityMap]);

	const totalCards = useMemo(
		() => Object.values(deck).reduce((a, b) => a + b, 0),
		[deck],
	);
	const [previewCard, setPreviewCard] = useState(null);

	return (
		<div className="feature-panel z-100 flex h-full w-[300px] flex-col border-l border-primary/20">
			<div className="border-b border-[#333] p-4">
				<div className="mt-2 text-sm text-[#aaa]">
					Total: {totalCards} cards
				</div>
				<Button onClick={onClear} className="mt-2 w-full">
					Clear Deck
				</Button>
				<Button onClick={onOpenDetails} className="mt-2 w-full">
					View Details
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto p-4">
				{deckList.length === 0 ? (
					<div className="mt-8 text-center text-[#666]">
						{Object.keys(deck || {}).length > 0
							? "デッキにカードが含まれていますが、カードデータが見つかりません。"
							: "デッキにカードが入っていません。"}
					</div>
				) : (
					deckList.map((card) => (
						<div
							className="feature-card mb-2 flex items-center justify-between rounded p-2"
							key={card.id}
						>
							<div className="flex items-center gap-2 overflow-hidden">
								<button
									type="button"
									onClick={() => setPreviewCard(card)}
									className="relative size-[30px] shrink-0 cursor-pointer overflow-hidden rounded-full bg-black"
								>
									<Image
										src={card.image}
										alt={card.name}
										width={45}
										height={45}
										className="absolute inset-0 h-full w-full scale-150 object-cover object-[center_top]"
									/>
								</button>
								<div className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm">
									{card.name}
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-1">
								<span className="font-bold pr-1">x{card.count}</span>
								<Button onClick={() => onRemove(card.id)} className="w-9 p-0">
									-
								</Button>
								<Button onClick={() => onAdd(card)} className="w-9 p-0">
									+
								</Button>
							</div>
						</div>
					))
				)}
			</div>
			{previewCard && (
				<CardPreviewModal
					card={previewCard}
					open={!!previewCard}
					onOpenChange={(details) => {
						if (!details.open) setPreviewCard(null);
					}}
				/>
			)}
		</div>
	);
};

export default DeckSidebar;
