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
		<div
			className="feature-panel"
			style={{
				width: "300px",
				borderLeft: "1px solid rgba(123, 190, 255, 0.2)",
				display: "flex",
				flexDirection: "column",
				height: "100%",
				zIndex: 100,
			}}
		>
			<div style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
				<div style={{ fontSize: "0.9em", color: "#aaa", marginTop: "0.5rem" }}>
					Total: {totalCards} cards
				</div>
				<Button
					onClick={onClear}
					style={{ marginTop: "0.5rem", width: "100%" }}
				>
					Clear Deck
				</Button>
				<Button
					onClick={onOpenDetails}
					style={{ marginTop: "0.5rem", width: "100%" }}
				>
					View Details
				</Button>
			</div>
			<div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
				{deckList.length === 0 ? (
					<div
						style={{ color: "#666", textAlign: "center", marginTop: "2rem" }}
					>
						{Object.keys(deck || {}).length > 0
							? "デッキにカードが含まれていますが、カードデータが見つかりません。"
							: "デッキにカードが入っていません。"}
					</div>
				) : (
					deckList.map((card) => (
						<div
							className="feature-card"
							key={card.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "0.5rem",
								padding: "0.5rem",
								borderRadius: "4px",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									overflow: "hidden",
								}}
							>
								<div
									onClick={() => setPreviewCard(card)}
									style={{
										width: "30px",
										height: "30px",
										borderRadius: "50%",
										backgroundSize: "150%",
										backgroundPosition: "top center",
										backgroundImage: `url(${card.image})`,
										backgroundColor: "black",
										cursor: "pointer",
									}}
								/>
								<div
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										fontSize: "0.9em",
										textAlign: "left",
									}}
								>
									{card.name}
								</div>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									flexShrink: 0,
								}}
							>
								<span style={{ fontWeight: "bold" }}>x{card.count}</span>
								<Button
									onClick={() => onRemove(card.id)}
									style={{ width: "24px", padding: 0 }}
								>
									-
								</Button>
								<Button
									onClick={() => onAdd(card)}
									style={{ width: "24px", padding: 0 }}
								>
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
					onClose={() => setPreviewCard(null)}
				/>
			)}
		</div>
	);
};

export default DeckSidebar;
