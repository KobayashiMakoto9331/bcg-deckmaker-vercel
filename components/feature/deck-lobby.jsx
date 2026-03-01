import React, { useState } from "react";
import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Menu } from "@/components/ui/menu/menu";
import { getDisplayLength } from "@/legacy/utils/storage";
import DeckDetailModal from "./deck-detail-modal";

const DeckLobby = ({
	decks,
	publicDecks,
	cards,
	users = [],
	onCreateNew,
	onSelectDeck,
	onCopyDeck,
	onDeleteDeck,
	onRenameDeck,
	onExportToPublic,
	onImportFromPublic,
	currentUser,
	onSelectUser,
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

	const handleAdvancedAction = (action) => {
		if (action === "create") {
			onCreateNew();
			return;
		}

		if (action === "import") {
			if (isPublicUser) return;
			setShowImportModal(true);
			return;
		}

		if (!selectedDeckId || !selectedDeck) return;

		if (action === "export") {
			if (selectedDeck.hasCriticalError) return;
			onExportToPublic(selectedDeckId);
			return;
		}

		if (action === "rename") {
			if (selectedDeck.hasCriticalError) return;
			setRenamingDeck(selectedDeck);
			setRenameInput(selectedDeck.name);
			setRenameError("");
			return;
		}

		if (action === "copy") {
			if (selectedDeck.hasCriticalError) return;
			onCopyDeck(selectedDeckId);
			return;
		}

		if (action === "detail") {
			setDeckToView(selectedDeck);
			return;
		}

		if (
			action === "delete" &&
			window.confirm(`Delete this deck?\n${selectedDeck.name}`)
		) {
			onDeleteDeck(selectedDeckId);
			setSelectedDeckId(null);
		}
	};

	return (
		<div className="mx-auto flex h-screen min-h-dvh max-w-[1000px] flex-col box-border overflow-y-auto p-4">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<Menu
						label={currentUser?.name ?? "Switch User"}
						triggerIcon={CircleUserRound}
						className="w-auto min-w-[160px]"
						actions={users.map((user) => ({
							value: user.id,
							label: user.name,
							disabled: user.id === currentUser?.id,
						}))}
						onActionSelect={(userId) => {
							const selectedUser = users.find((user) => user.id === userId);
							if (selectedUser) onSelectUser(selectedUser);
						}}
						variant="secondary"
					/>
					<Menu
						variant="success"
						label="Actions"
						className="w-auto min-w-[150px]"
						actions={[
							{
								value: "create",
								label: "Create",
							},
							{
								value: "detail",
								label: "Detail",
								disabled: !selectedDeckId,
							},
							{
								value: "import",
								label: "Import from Public",
								disabled: isPublicUser,
							},
							{
								value: "export",
								label: "Export to Public",
								disabled: !selectedDeckId || selectedDeck?.hasCriticalError,
							},
							{
								value: "rename",
								label: "Rename",
								disabled: !selectedDeckId || selectedDeck?.hasCriticalError,
							},
							{
								value: "copy",
								label: "Copy",
								disabled: !selectedDeckId || selectedDeck?.hasCriticalError,
							},
							{
								value: "delete",
								label: "Delete",
								disabled: !selectedDeckId,
							},
						]}
						onActionSelect={handleAdvancedAction}
					/>
					<Button
						disabled={!selectedDeckId || selectedDeck?.hasCriticalError}
						onClick={() => onSelectDeck(selectedDeck)}
					>
						Edit
					</Button>
				</div>
				<div className="flex gap-2" />
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
								className={`feature-card group relative cursor-pointer overflow-hidden rounded-lg p-4 text-left transition-all duration-200 ${
									isSelected
										? "bg-[rgba(45,69,104,0.92)] shadow-[0_0_24px_rgba(20,160,230,0.4)]"
										: "hover:bg-[rgba(33,56,89,0.7)]"
								}`}
								style={{
									border: isSelected
										? "2px solid #14a0e6"
										: "2px solid rgba(20, 160, 230, 0.22)",
								}}
								onClick={() => setSelectedDeckId(deck.id)}
							>
								<div className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-[1.1rem] font-bold">
									{deck.name}
								</div>
								<div className="flex items-center gap-2 text-[0.85rem] text-[#aaa]">
									{deck.hasCriticalError && (
										<span className="rounded border border-red-500 bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-500">
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
				<div className="feature-modal-overlay fixed inset-0 z-1000 flex items-center justify-center">
					<div className="feature-modal-panel flex w-[400px] flex-col gap-4 rounded-lg p-8">
						<h3>Rename Deck</h3>
						<Input
							value={renameInput}
							onChange={(e) => setRenameInput(e.target.value)}
							autoFocus
						/>
						{renameError && (
							<div className="text-sm text-[#ff4444]">{renameError}</div>
						)}
						<div className="flex justify-end gap-2">
							<Button onClick={() => setRenamingDeck(null)}>Cancel</Button>
							<Button onClick={confirmRename}>OK</Button>
						</div>
					</div>
				</div>
			)}

			{showImportModal && (
				<div className="feature-modal-overlay fixed inset-0 z-1000 flex items-center justify-center">
					<div className="feature-modal-panel relative flex max-h-[80vh] w-[500px] flex-col gap-4 rounded-lg p-8">
						<h3 className="m-0">Import from Public</h3>
						<Button
							onClick={() => setShowImportModal(false)}
							className="absolute right-4 top-4"
						>
							x
						</Button>
						<div className="flex-1 overflow-y-auto rounded border border-[#444] p-2">
							{!publicDecks || publicDecks.length === 0 ? (
								<div className="p-4 text-center text-[#888]">
									No public decks found.
								</div>
							) : (
								publicDecks.map((pd) => (
									<div
										key={pd.id}
										className="feature-card mb-2 flex items-center justify-between rounded p-2"
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
