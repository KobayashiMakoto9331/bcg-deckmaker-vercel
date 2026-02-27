import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import CardPreviewModal from "./card-preview-modal";

const CardGrid = ({
	cards = [],
	deck = {},
	onSetCount,
	sortKey,
	setSortKey,
	sortDirection,
	setSortDirection,
	isFilterOpen,
	onCloseFilter,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [previewCard, setPreviewCard] = useState(null);
	const [gridCols, setGridCols] = useState(4);

	const filteredCards = useMemo(() => {
		let result = (cards || []).filter((card) => {
			const q = searchTerm.toLowerCase();
			return (
				card.name?.toLowerCase().includes(q) ||
				card.id?.toLowerCase().includes(q) ||
				card.text?.toLowerCase().includes(q)
			);
		});

		result = result.sort((a, b) => {
			let valA;
			let valB;
			if (sortKey === "ID") {
				valA = a.id;
				valB = b.id;
			} else {
				const isBad = (v) =>
					v === undefined || v === null || v === "-" || Number.isNaN(Number(v));
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
			return 0;
		});
		return result;
	}, [cards, searchTerm, sortKey, sortDirection]);

	return (
		<div className="p-0">
			{isFilterOpen && (
				<div className="feature-modal-overlay fixed inset-0 z-2000 flex flex-col gap-4 overflow-y-auto px-16 py-8">
					<div className="flex items-center justify-between border-b border-[#333] pb-4">
						<h2 className="m-0 text-[#fce100]">Filters & Sort</h2>
						<div className="flex gap-4">
							<Button onClick={() => setSearchTerm("")}>Clear</Button>
							<Button onClick={onCloseFilter}>Close</Button>
						</div>
					</div>
					<Input
						placeholder="Search Name, ID, Text..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<div className="flex items-center gap-2">
						<span className="text-[#aaa]">Sort:</span>
						<select
							className="rounded border border-[#444] bg-[#222] px-3 py-1.5 text-[#eee]"
							value={sortKey}
							onChange={(e) => setSortKey(e.target.value)}
						>
							<option value="ID">ID</option>
							<option value="Lv.">Lv.</option>
							<option value="COST">COST</option>
							<option value="AP">AP</option>
							<option value="HP">HP</option>
						</select>
						<Button
							onClick={() =>
								setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
							}
						>
							{sortDirection === "asc" ? "昇順" : "降順"}
						</Button>
						<Button onClick={() => setGridCols((prev) => (prev === 4 ? 8 : 4))}>
							{gridCols === 4 ? "4列" : "8列"}
						</Button>
					</div>
				</div>
			)}

			<div className="mb-2">Showing {filteredCards.length} cards</div>
			<div
				className={`grid ${gridCols === 8 ? "grid-cols-8 gap-1.5" : "grid-cols-4 gap-4"}`}
			>
				{filteredCards.map((card) => {
					const count = deck[card.id] || 0;
					return (
						<div
							key={card.id}
							className="card-container relative rounded-lg border border-[rgba(255,255,255,0.2)] bg-[linear-gradient(180deg,rgba(25,43,70,0.72)_0%,rgba(15,27,47,0.82)_100%)] p-1.5"
						>
							<div
								className={`mb-1 flex justify-center ${gridCols === 8 ? "gap-0" : "gap-0.5"}`}
							>
								{[0, 1, 2, 3, 4].map((num) => (
									<Button
										key={num}
										onClick={(e) => {
											e.stopPropagation();
											onSetCount(card, num);
										}}
										className={`min-w-0 max-w-10 flex-1 px-0! ${
											gridCols === 8 ? "py-0!" : "py-0.5!"
										} ${count === num ? "bg-[#646cff]!" : "bg-[#333]!"}`}
									>
										{num}
									</Button>
								))}
							</div>
							<button
								type="button"
								className="relative aspect-250/350 w-full overflow-hidden rounded-lg bg-black cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									setPreviewCard(card);
								}}
							>
								<div className="absolute inset-0 z-0 flex items-center justify-center p-2.5 text-center text-[0.9rem] text-[#888]">
									{card.name}
								</div>
								<Image
									src={card.image}
									alt={card.name}
									width={250}
									height={350}
									className="relative z-1 block h-full w-full rounded-lg object-cover"
									loading="lazy"
									draggable="false"
								/>
							</button>
						</div>
					);
				})}
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

export default CardGrid;
