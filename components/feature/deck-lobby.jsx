import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { useDebounceClick } from "@/legacy/hooks/useDebounceClick";
import { getDisplayLength } from "@/legacy/utils/storage";
import DeckDetailModal from "./deck-detail-modal";

const DeckLobby = ({
	decks,
	publicDecks,
	cards,
	onCreateNew,
	onSelectDeck,
	onCopyDeck,
	onDeleteDeck,
	onRenameDeck,
	onExportToPublic,
	onImportFromPublic,
	currentUser,
	onChangeUser,
}) => {
	const [deckToView, setDeckToView] = useState(null);
	const [renamingDeck, setRenamingDeck] = useState(null);
	const [renameInput, setRenameInput] = useState("");
	const [renameError, setRenameError] = useState("");
	const [showImportModal, setShowImportModal] = useState(false);
	const [selectedDeckId, setSelectedDeckId] = useState(null);

	const cardsMap = React.useMemo(() => {
		const map = {};
		if (cards)
			cards.forEach((c) => {
				map[c.id] = c;
			});
		return map;
	}, [cards]);

	const processedDecks = React.useMemo(
		() =>
			decks.map((deck) => {
				const missingCardIds = Object.keys(deck.cards || {}).filter(
					(id) => !cardsMap[id],
				);
				return { ...deck, hasCriticalError: missingCardIds.length > 0 };
			}),
		[decks, cardsMap],
	);

	const confirmRename = () => {
		if (!renameInput.trim()) return;
		if (getDisplayLength(renameInput) > 40) {
			setRenameError("デッキ名上限は全角20文字分です。");
			return;
		}
		const exists = decks.some(
			(d) => d.name === renameInput && d.id !== renamingDeck.id,
		);
		if (exists) {
			setRenameError("既に同名のデッキがあります");
			return;
		}
		onRenameDeck(renamingDeck.id, renameInput);
		setRenamingDeck(null);
		setRenameInput("");
		setRenameError("");
	};

	const selectedDeck = processedDecks.find((d) => d.id === selectedDeckId);
	const isPublicUser = currentUser?.id === "public";
	const debouncedCreateNew = useDebounceClick(onCreateNew);
	const debouncedChangeUser = useDebounceClick(onChangeUser);

	return (
		<div className="mx-auto flex h-screen max-w-[1000px] flex-col box-border p-4">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<span className="text-[#aaa]">
						User: <strong className="text-white">{currentUser?.name}</strong>
					</span>
					<Button onClick={debouncedChangeUser}>Change User</Button>
				</div>
				<div className="flex gap-2">
					{!isPublicUser && (
						<Button onClick={() => setShowImportModal(true)}>
							Import from Public
						</Button>
					)}
					<Button onClick={debouncedCreateNew}>Create New</Button>
				</div>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				<Button
					disabled={!selectedDeckId}
					onClick={() => {
						if (
							selectedDeck &&
							window.confirm(`Delete this deck?\n${selectedDeck.name}`)
						) {
							onDeleteDeck(selectedDeckId);
							setSelectedDeckId(null);
						}
					}}
				>
					Delete
				</Button>
				{!isPublicUser && (
					<Button
						disabled={!selectedDeckId || selectedDeck?.hasCriticalError}
						onClick={() => onExportToPublic(selectedDeckId)}
					>
						Export to Public
					</Button>
				)}
				<Button
					disabled={!selectedDeckId || selectedDeck?.hasCriticalError}
					onClick={() => {
						setRenamingDeck(selectedDeck);
						setRenameInput(selectedDeck.name);
						setRenameError("");
					}}
				>
					Rename
				</Button>
				<Button
					disabled={!selectedDeckId || selectedDeck?.hasCriticalError}
					onClick={() => onCopyDeck(selectedDeckId)}
				>
					Copy
				</Button>
				<Button
					disabled={!selectedDeckId}
					onClick={() => setDeckToView(selectedDeck)}
				>
					Detail
				</Button>
				<Button
					disabled={!selectedDeckId || selectedDeck?.hasCriticalError}
					onClick={() => onSelectDeck(selectedDeck)}
				>
					Edit
				</Button>
			</div>

			<div className="mb-4 text-2xl font-bold text-[#fce100]">
				Your Decks ({decks.length})
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="grid grid-cols-2 gap-2">
					{processedDecks.length === 0 && (
						<div className="p-8 text-center text-[#888]">
							No decks found. Create one!
						</div>
					)}
					{processedDecks.map((deck) => {
						const cardCount = Object.values(deck.cards || {}).reduce(
							(a, b) => a + b,
							0,
						);
						const isSelected = deck.id === selectedDeckId;
						return (
							<button
								key={deck.id}
								type="button"
								className="feature-card"
								onClick={() => setSelectedDeckId(deck.id)}
								style={{
									backgroundColor: isSelected
										? "rgba(45, 69, 104, 0.86)"
										: undefined,
									border: isSelected
										? "2px solid #63d6ff"
										: "1px solid rgba(123, 190, 255, 0.2)",
									padding: "0.8rem 1rem",
									borderRadius: "8px",
									cursor: "pointer",
								}}
							>
								<div className="overflow-hidden text-left text-[1.1rem] font-bold text-ellipsis whitespace-nowrap">
									{deck.name}
								</div>
								<div className="flex items-center gap-2 text-[0.85rem] text-[#aaa]">
									{deck.hasCriticalError && (
										<span className="rounded border border-[#ff0000] bg-[#ffdada] px-[5px] py-px text-[0.8rem] font-bold text-[#ff0000]">
											❌ エラー：カードデータ無し
										</span>
									)}
									<span>Cards: {cardCount}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{renamingDeck && (
				<div
					className="feature-modal-overlay"
					style={{
						position: "fixed",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
				>
					<div
						className="feature-modal-panel"
						style={{
							padding: "2rem",
							borderRadius: "8px",
							width: "400px",
							display: "flex",
							flexDirection: "column",
							gap: "1rem",
						}}
					>
						<h3>Rename Deck</h3>
						<Input
							value={renameInput}
							onChange={(e) => setRenameInput(e.target.value)}
							autoFocus
						/>
						{renameError && (
							<div style={{ color: "#ff4444", fontSize: "0.9rem" }}>
								{renameError}
							</div>
						)}
						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								gap: "0.5rem",
							}}
						>
							<Button onClick={() => setRenamingDeck(null)}>Cancel</Button>
							<Button onClick={confirmRename}>OK</Button>
						</div>
					</div>
				</div>
			)}

			{showImportModal && (
				<div
					className="feature-modal-overlay"
					style={{
						position: "fixed",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
				>
					<div
						className="feature-modal-panel"
						style={{
							padding: "2rem",
							borderRadius: "8px",
							width: "500px",
							maxHeight: "80vh",
							display: "flex",
							flexDirection: "column",
							gap: "1rem",
							position: "relative",
						}}
					>
						<h3 className="m-0">Import from Public</h3>
						<Button
							onClick={() => setShowImportModal(false)}
							style={{ position: "absolute", top: "1rem", right: "1rem" }}
						>
							x
						</Button>
						<div
							style={{
								overflowY: "auto",
								flex: 1,
								border: "1px solid #444",
								borderRadius: "4px",
								padding: "0.5rem",
							}}
						>
							{!publicDecks || publicDecks.length === 0 ? (
								<div className="p-4 text-center text-[#888]">
									No public decks found.
								</div>
							) : (
								publicDecks.map((pd) => (
									<div
										key={pd.id}
										className="feature-card"
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "0.5rem",
											marginBottom: "0.5rem",
											borderRadius: "4px",
										}}
									>
										<div className="font-bold">{pd.name}</div>
										<Button
											onClick={() => {
												onImportFromPublic(pd.id);
												setShowImportModal(false);
											}}
										>
											Import
										</Button>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{deckToView && (
				<DeckDetailModal
					deck={deckToView.cards}
					cards={cards}
					onClose={() => setDeckToView(null)}
					readOnly
					onAdd={() => {}}
					onRemove={() => {}}
				/>
			)}
		</div>
	);
};

export default DeckLobby;
