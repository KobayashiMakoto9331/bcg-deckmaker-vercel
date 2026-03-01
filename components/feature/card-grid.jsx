import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import filterConfig from "@/legacy/data/filterConfig.json";
import CardPreviewModal from "./card-preview-modal";
import MultiSelectDropdown from "./multi-select-dropdown";

const COLORS = ["White", "Blue", "Purple", "Red", "Green"];
const TYPES = ["UNIT", "PILOT", "COMMAND", "BASE"];
const GRID_GAP_PX = { 4: 16, 8: 6 };
const CARD_ASPECT_HEIGHT = 350 / 250;
const CARD_BUTTON_ROW_PX = 30;
const CHUNK_ROWS = 8;

const VirtualChunk = ({
	chunkCards,
	chunkHeight,
	gridCols,
	rootElement,
	renderCard,
}) => {
	const { ref, inView } = useInView({
		skip: !rootElement,
		root: rootElement,
		rootMargin: "250px 0px",
		threshold: 0,
	});

	if (!rootElement || !inView) {
		return <div ref={ref} style={{ height: `${chunkHeight}px` }} />;
	}

	return (
		<div
			ref={ref}
			className={`grid ${gridCols === 8 ? "grid-cols-8 gap-1.5" : "grid-cols-4 gap-4"}`}
		>
			{chunkCards.map((card) => renderCard(card))}
		</div>
	);
};

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
	const [activeColors, setActiveColors] = useState([]);
	const [activeTypes, setActiveTypes] = useState([]);
	const [previewCard, setPreviewCard] = useState(null);
	const [showFoil, setShowFoil] = useState(false);
	const [gridCols, setGridCols] = useState(4);
	const [viewportWidth, setViewportWidth] = useState(0);
	const [viewportElement, setViewportElement] = useState(null);
	const listViewportRef = useRef(null);

	const [filterFeatures, setFilterFeatures] = useState([]);
	const [filterLinks, setFilterLinks] = useState([]);
	const [filterSources, setFilterSources] = useState([]);
	const [filterObtains, setFilterObtains] = useState([]);
	const [filterTerrains, setFilterTerrains] = useState([]);
	const [filterSets, setFilterSets] = useState([]);
	const [filterLevels, setFilterLevels] = useState([]);
	const [filterCosts, setFilterCosts] = useState([]);
	const [filterAPs, setFilterAPs] = useState([]);
	const [filterHPs, setFilterHPs] = useState([]);
	const [filterRarities, setFilterRarities] = useState([]);
	const [filterAbilities, setFilterAbilities] = useState([]);

	const clearAllFilters = () => {
		setSearchTerm("");
		setActiveColors([]);
		setActiveTypes([]);
		setFilterFeatures([]);
		setFilterLinks([]);
		setFilterSources([]);
		setFilterObtains([]);
		setFilterTerrains([]);
		setFilterSets([]);
		setFilterLevels([]);
		setFilterCosts([]);
		setFilterAPs([]);
		setFilterHPs([]);
		setFilterRarities([]);
		setFilterAbilities([]);
		setShowFoil(false);
	};

	const toggleColor = (color) => {
		setActiveColors((prev) =>
			prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
		);
	};
	const toggleType = (type) => {
		setActiveTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
		);
	};

	const effectiveRarityMap = useMemo(() => {
		const map = {};
		const nonPRarities = {};

		(cards || []).forEach((c) => {
			const r = (c.rarity || "").replace(/[+\uff0b]/g, "").trim();
			if (r && r !== "P") {
				if (!nonPRarities[c.name]) nonPRarities[c.name] = new Set();
				nonPRarities[c.name].add(r);
			}
		});

		(cards || []).forEach((c) => {
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

	const {
		features,
		links,
		sources,
		obtains,
		terrains,
		sets,
		levels,
		costs,
		aps,
		hps,
		rarities,
	} = useMemo(() => {
		const fSet = new Set();
		const lSet = new Set();
		const sSet = new Set();
		const oSet = new Set();
		const tSet = new Set();
		const setSet = new Set();
		const rSet = new Set();
		const lvSet = new Set();
		const costSet = new Set();
		const apSet = new Set();
		const hpSet = new Set();

		(cards || []).forEach((card) => {
			const stats = card.stats || {};

			if (stats.特徴) {
				stats.特徴.split(/[〔〕]+/).forEach((f) => {
					const t = f.trim();
					if (t) fSet.add(t);
				});
			}
			if (stats.リンク) lSet.add(stats.リンク);
			if (stats.出典タイトル) sSet.add(stats.出典タイトル);
			if (stats.入手情報) oSet.add(stats.入手情報);
			if (stats.地形) {
				stats.地形.split(/[\s・]+/).forEach((t) => {
					if (t) tSet.add(t);
				});
			}

			const r = effectiveRarityMap[card.id];
			if (r) rSet.add(r);

			const obtain = stats.入手情報 || "";
			const shouldInclude = filterConfig.setFilter.includeKeywords.some((k) =>
				obtain.includes(k),
			);
			if (shouldInclude) {
				const shouldExclude = filterConfig.setFilter.excludeKeywords.some((k) =>
					obtain.includes(k),
				);
				if (!shouldExclude) setSet.add(obtain);
			}

			if (stats["Lv."] !== undefined) lvSet.add(stats["Lv."]);
			if (stats.COST !== undefined) costSet.add(stats.COST);
			if (stats.AP !== undefined) apSet.add(stats.AP);
			if (stats.HP !== undefined) hpSet.add(stats.HP);
		});

		const numSort = (a, b) => Number(a) - Number(b);
		const rarityOrder = ["L", "LR", "SR", "R", "U", "C", "ST", "P"];
		const raritySort = (a, b) =>
			rarityOrder.indexOf(a) - rarityOrder.indexOf(b);

		return {
			features: Array.from(fSet).sort(),
			links: Array.from(lSet).sort(),
			sources: Array.from(sSet).sort(),
			obtains: Array.from(oSet).sort(),
			terrains: Array.from(tSet).sort(),
			sets: Array.from(setSet).sort(),
			levels: Array.from(lvSet).sort(numSort),
			costs: Array.from(costSet).sort(numSort),
			aps: Array.from(apSet).sort(numSort),
			hps: Array.from(hpSet).sort(numSort),
			rarities: Array.from(rSet).sort(raritySort),
		};
	}, [cards, effectiveRarityMap]);

	const filteredCards = useMemo(() => {
		let result = (cards || []).filter((card) => {
			const textMatch =
				card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				card.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				card.id?.toLowerCase().includes(searchTerm.toLowerCase());
			if (!textMatch) return false;

			if (activeColors.length > 0) {
				const cardColor = card.stats?.色;
				if (!cardColor || !activeColors.includes(cardColor)) return false;
			}

			if (activeTypes.length > 0) {
				const cardType = card.stats?.タイプ;
				const cardText = card.text || "";
				const isDualPilot = cardText.includes("【パイロット】「");
				const types = [cardType, ...(isDualPilot ? ["PILOT"] : [])];
				if (!activeTypes.some((t) => types.includes(t))) return false;
			}

			const check = (filter, value) =>
				filter.length === 0 ? true : filter.includes(value);

			if (filterFeatures.length > 0) {
				const raw = card.stats?.特徴 || "";
				const cardFeatures = raw
					.split(/[〔〕]+/)
					.map((s) => s.trim())
					.filter((s) => s);
				if (!filterFeatures.some((f) => cardFeatures.includes(f))) return false;
			}
			if (!check(filterLinks, card.stats?.リンク)) return false;
			if (!check(filterSources, card.stats?.出典タイトル)) return false;
			if (!check(filterObtains, card.stats?.入手情報)) return false;
			if (!check(filterLevels, card.stats?.["Lv."])) return false;
			if (!check(filterCosts, card.stats?.COST)) return false;
			if (!check(filterAPs, card.stats?.AP)) return false;
			if (!check(filterHPs, card.stats?.HP)) return false;

			if (filterRarities.length > 0) {
				const r = effectiveRarityMap[card.id];
				if (!filterRarities.includes(r)) return false;
			}

			if (filterAbilities.length > 0) {
				const text = card.text || "";
				const hasAbility = filterAbilities.some((abilityLabel) => {
					const configItem = filterConfig.abilities.find(
						(a) => a.label === abilityLabel,
					);
					const searchStr = configItem ? configItem.query : abilityLabel;
					return text.includes(searchStr);
				});
				if (!hasAbility) return false;
			}

			if (!showFoil) {
				const obtain = card.stats?.入手情報 || "";
				if (
					filterConfig.foilFilter.excludeKeywords.some((k) =>
						obtain.includes(k),
					)
				)
					return false;
			}

			if (filterTerrains.length > 0) {
				const t = card.stats?.地形 || "";
				const cardTerrains = t.split(/[\s・]+/);
				if (!filterTerrains.some((ft) => cardTerrains.includes(ft)))
					return false;
			}

			if (filterSets.length > 0) {
				const obtain = card.stats?.入手情報 || "";
				if (!filterSets.includes(obtain)) return false;
			}

			return true;
		});

		result = result.sort((a, b) => {
			let valA;
			let valB;
			if (sortKey === "ID") {
				valA = a.id;
				valB = b.id;
			} else if (sortKey === "Color") {
				const colorOrder = ["White", "Blue", "Purple", "Red", "Green"];
				const getColorScore = (c) => {
					if (c === "-") return sortDirection === "asc" ? 999 : -999;
					const idx = colorOrder.indexOf(c);
					if (idx === -1) return -1;
					return idx;
				};
				valA = getColorScore(a.stats?.色);
				valB = getColorScore(b.stats?.色);
			} else if (sortKey === "Rarity") {
				const order = ["L", "LR", "SR", "R", "U", "C", "ST", "P"];
				const getScore = (r) => {
					const idx = order.indexOf(r);
					if (idx === -1) return -1;
					return 100 - idx;
				};
				valA = getScore(effectiveRarityMap[a.id] || "");
				valB = getScore(effectiveRarityMap[b.id] || "");
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
	}, [
		cards,
		searchTerm,
		activeColors,
		activeTypes,
		filterFeatures,
		filterLinks,
		filterSources,
		filterObtains,
		filterTerrains,
		filterSets,
		filterLevels,
		filterCosts,
		filterAPs,
		filterHPs,
		filterAbilities,
		filterRarities,
		sortKey,
		sortDirection,
		showFoil,
		effectiveRarityMap,
	]);

	const rowHeight = useMemo(() => {
		const viewport = listViewportRef.current;
		const width = viewportWidth || viewport?.clientWidth || 0;
		if (!width) return 420;
		const gap = gridCols === 8 ? GRID_GAP_PX[8] : GRID_GAP_PX[4];
		const cardWidth = (width - gap * (gridCols - 1)) / gridCols;
		const imageHeight = cardWidth * CARD_ASPECT_HEIGHT;
		return Math.ceil(imageHeight + CARD_BUTTON_ROW_PX);
	}, [gridCols, viewportWidth]);

	const chunkSize = gridCols * CHUNK_ROWS;
	const rowGap = gridCols === 8 ? GRID_GAP_PX[8] : GRID_GAP_PX[4];
	const cardChunks = useMemo(() => {
		const chunks = [];
		for (let i = 0; i < filteredCards.length; i += chunkSize) {
			const chunkCards = filteredCards.slice(i, i + chunkSize);
			const rowsInChunk = Math.ceil(chunkCards.length / gridCols);
			const chunkHeight =
				rowsInChunk * rowHeight + Math.max(0, rowsInChunk - 1) * rowGap;
			chunks.push({
				id: `${i}-${chunkCards[0]?.id || "chunk"}`,
				chunkCards,
				chunkHeight,
			});
		}
		return chunks;
	}, [filteredCards, chunkSize, gridCols, rowHeight, rowGap]);

	const virtualResetKey = [
		searchTerm,
		activeColors.join(","),
		activeTypes.join(","),
		filterFeatures.join(","),
		filterLinks.join(","),
		filterSources.join(","),
		filterObtains.join(","),
		filterTerrains.join(","),
		filterSets.join(","),
		filterLevels.join(","),
		filterCosts.join(","),
		filterAPs.join(","),
		filterHPs.join(","),
		filterRarities.join(","),
		filterAbilities.join(","),
		showFoil ? "1" : "0",
		sortKey,
		sortDirection,
		gridCols,
	].join("|");

	useEffect(() => {
		const viewport = listViewportRef.current;
		if (!viewport || typeof ResizeObserver === "undefined") return;
		setViewportElement(viewport);
		const updateSize = () => {
			setViewportWidth(viewport.clientWidth || 0);
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(viewport);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		void virtualResetKey;
		if (listViewportRef.current) listViewportRef.current.scrollTop = 0;
	}, [virtualResetKey]);

	const renderCard = (card) => {
		const count = deck[card.id] || 0;
		const isRestrictedName =
			filterConfig.deckConstruction?.restrictedNames?.includes(card.name);
		const cardType = card.stats?.タイプ;
		const isRestrictedType =
			cardType &&
			filterConfig.deckConstruction?.restrictedTypes?.includes(cardType);
		const isRestricted = isRestrictedName || isRestrictedType;

		return (
			<div key={card.id}>
				<div
					className={`mb-1 flex min-h-[30px] justify-center ${gridCols === 8 ? "gap-0" : "gap-0.5"}`}
				>
					{!isRestricted &&
						[0, 1, 2, 3, 4].map((num) => (
							<Button
								key={num}
								onClick={(e) => {
									e.stopPropagation();
									onSetCount?.(card, num);
								}}
								selected={count === num}
								className={`min-w-0 max-w-10 flex-1 px-0! ${
									gridCols === 8 ? "py-0!" : "py-0.5!"
								}`}
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
						fill
						unoptimized
						sizes={gridCols === 8 ? "12vw" : "25vw"}
						className="relative z-1 block h-full w-full rounded-lg object-cover"
						draggable={false}
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				</button>
			</div>
		);
	};

	return (
		<div className="flex h-full min-h-0 flex-col p-0">
			{isFilterOpen && (
				<div className="feature-modal-overlay fixed inset-0 z-2000 flex flex-col gap-4 overflow-y-auto px-16 py-8">
					<div className="flex items-center justify-between border-b border-[#333] pb-4">
						<h2 className="m-0 text-[#fce100]">Filters & Sort</h2>
						<div className="flex gap-6">
							<Button onClick={clearAllFilters} variant="destructive">
								Clear All
							</Button>
							<Button onClick={onCloseFilter}>Close</Button>
						</div>
					</div>
					<Input
						placeholder="Search Name, ID, Text..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<div className="flex flex-wrap justify-center gap-1.5">
						{COLORS.map((color) => {
							const colorMap = {
								Blue: "#2196F3",
								Green: "#4CAF50",
								Red: "#F44336",
								Purple: "#9C27B0",
								White: "#FFFFFF",
								Yellow: "#FFC107",
								Black: "#9E9E9E",
							};
							const colorCode = colorMap[color] || color;
							const isActive = activeColors.includes(color);
							const isLight = ["White", "Yellow"].includes(color);
							return (
								<button
									type="button"
									key={color}
									onClick={() => toggleColor(color)}
									className="min-w-[60px] flex-1 cursor-pointer px-3 py-1.5 text-sm"
									style={{
										backgroundColor: isActive ? colorCode : "#222",
										color: isActive ? (isLight ? "black" : "white") : colorCode,
										border: `1px solid ${colorCode}`,
										opacity: isActive ? 1 : 0.7,
									}}
								>
									{color}
								</button>
							);
						})}
					</div>
					<div className="flex flex-wrap justify-center gap-1.5">
						{TYPES.map((type) => (
							<button
								type="button"
								key={type}
								onClick={() => toggleType(type)}
								className={`flex-1 border px-3 py-1.5 text-sm ${
									activeTypes.includes(type)
										? "border-[#666] bg-[#444] text-white"
										: "border-[#555] bg-[#222] text-[#888]"
								}`}
							>
								{type}
							</button>
						))}
					</div>
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
							<option value="Rarity">Rarity</option>
							<option value="Color">Color</option>
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
						<label className="flex items-center gap-2 rounded border border-[#444] px-3 py-1.5 text-sm text-[#eee]">
							<input
								type="checkbox"
								checked={showFoil}
								onChange={(e) => setShowFoil(e.target.checked)}
								className="accent-[#646cff]"
							/>
							Show Foil
						</label>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<MultiSelectDropdown
							label="収録弾"
							options={sets}
							selected={filterSets}
							onChange={setFilterSets}
						/>
						<MultiSelectDropdown
							label="出典"
							options={sources}
							selected={filterSources}
							onChange={setFilterSources}
						/>
						<MultiSelectDropdown
							label="Lv."
							options={levels}
							selected={filterLevels}
							onChange={setFilterLevels}
						/>
						<MultiSelectDropdown
							label="COST"
							options={costs}
							selected={filterCosts}
							onChange={setFilterCosts}
						/>
						<MultiSelectDropdown
							label="AP"
							options={aps}
							selected={filterAPs}
							onChange={setFilterAPs}
						/>
						<MultiSelectDropdown
							label="HP"
							options={hps}
							selected={filterHPs}
							onChange={setFilterHPs}
						/>
						<MultiSelectDropdown
							label="能力"
							options={filterConfig.abilities.map((a) => a.label)}
							selected={filterAbilities}
							onChange={setFilterAbilities}
						/>
						<MultiSelectDropdown
							label="特徴"
							options={features}
							selected={filterFeatures}
							onChange={setFilterFeatures}
						/>
						<MultiSelectDropdown
							label="リンク"
							options={links}
							selected={filterLinks}
							onChange={setFilterLinks}
						/>
						<MultiSelectDropdown
							label="レアリティ"
							options={rarities}
							selected={filterRarities}
							onChange={setFilterRarities}
						/>
						<MultiSelectDropdown
							label="入手"
							options={obtains}
							selected={filterObtains}
							onChange={setFilterObtains}
						/>
						<MultiSelectDropdown
							label="地形"
							options={terrains}
							selected={filterTerrains}
							onChange={setFilterTerrains}
						/>
					</div>
				</div>
			)}

			<div className="mb-2">Showing {filteredCards.length} cards</div>
			<div
				ref={listViewportRef}
				className="min-h-0 flex-1 overflow-y-auto pr-1"
			>
				<div className="flex flex-col gap-2">
					{cardChunks.map((chunk) => (
						<VirtualChunk
							key={chunk.id}
							chunkCards={chunk.chunkCards}
							chunkHeight={chunk.chunkHeight}
							gridCols={gridCols}
							rootElement={viewportElement}
							renderCard={renderCard}
						/>
					))}
				</div>
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
