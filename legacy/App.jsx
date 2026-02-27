import { useEffect, useState } from "react";
import DeckEditor from "./components/DeckEditor";
import DeckLobby from "./components/DeckLobby";
import UserSelectionScreen from "./components/UserSelectionScreen";
import { generateId } from "./utils/idGenerator";
import {
	copyDeckInStorage,
	deleteDeckFromStorage,
	exportDeckToPublic,
	getDecks,
	importDeckFromPublic,
	renameDeckInStorage,
	saveDeckToStorage,
} from "./utils/storage";

function App() {
	const [view, setView] = useState("lobby");
	const [currentDeckId, setCurrentDeckId] = useState(null);
	const [tempDeckId, setTempDeckId] = useState(null);
	const [decks, setDecks] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [cardData, setCardData] = useState([]);
	const [isLoadingCards, setIsLoadingCards] = useState(true);

	useEffect(() => {
		getDecks().then(setDecks);
	}, []);

	useEffect(() => {
		const loadCards = async () => {
			setIsLoadingCards(true);
			try {
				const res = await fetch(`/cards_packed.json?t=${Date.now()}`);
				if (res.ok) {
					const data = await res.json();
					setCardData(data);
					return;
				}
				throw new Error("Packed cards not found");
			} catch {
				try {
					const res = await fetch(`/api/cards?t=${Date.now()}`);
					if (res.ok) {
						const data = await res.json();
						setCardData(data);
						return;
					}
				} catch {
					// keep empty
				}
				setCardData([]);
			} finally {
				setIsLoadingCards(false);
			}
		};
		loadCards();
	}, []);

	const handleCreateNew = () => {
		const userDecks = decks.filter((d) => d.ownerId === currentUser?.id);
		if (userDecks.length >= 999) {
			alert("デッキ数が上限(999)です。");
			return;
		}
		setCurrentDeckId(null);
		setTempDeckId(generateId());
		setView("editor");
	};

	const handleSelectDeck = (deck) => {
		setCurrentDeckId(deck.id);
		setTempDeckId(null);
		setView("editor");
	};

	const handleSaveDeck = async (deckData) => {
		if (!deckData.id) {
			deckData.id = generateId();
			const userDecks = decks.filter((d) => d.ownerId === currentUser?.id);
			if (userDecks.length >= 999) {
				alert("デッキ数が上限(999)です。");
				return;
			}
		}
		if (!deckData.ownerId && currentUser) {
			deckData.ownerId = currentUser.id;
		}

		const newDecks = await saveDeckToStorage(deckData);
		setDecks(newDecks);

		if (deckData.wasRenamed) {
			alert(
				`Deck saved!\n${deckData.name}\n既に同名のデッキがあるため、自動で番号を付与しました。`,
			);
		} else {
			alert(`Deck saved!\n${deckData.name}`);
		}

		if (currentDeckId !== deckData.id) {
			setCurrentDeckId(deckData.id);
			setTempDeckId(null);
		}
	};

	const handleCloseEditor = () => {
		setView("lobby");
		setCurrentDeckId(null);
		setTempDeckId(null);
	};

	const handleCopyDeck = async (id) => {
		try {
			const sourceDeck = decks.find((d) => d.id === id);
			if (sourceDeck) {
				const userDecks = decks.filter((d) => d.ownerId === sourceDeck.ownerId);
				if (userDecks.length >= 999) {
					alert("デッキ数が上限(999)です。");
					return;
				}
			}
			const newDecks = await copyDeckInStorage(id);
			setDecks(newDecks);
		} catch (e) {
			alert(e.message);
		}
	};

	const handleDeleteDeck = async (id) => {
		const newDecks = await deleteDeckFromStorage(id);
		setDecks(newDecks);
	};

	const handleRenameDeck = async (id, newName) => {
		const newDecks = await renameDeckInStorage(id, newName);
		setDecks(newDecks);
	};

	const handleExportToPublic = async (id) => {
		try {
			const deckToExport = decks.find((d) => d.id === id);
			const deckName = deckToExport ? deckToExport.name : "";
			if (!window.confirm(`このデッキをPublicにコピーしますか？\n${deckName}`))
				return;
			const newDecks = await exportDeckToPublic(id);
			setDecks(newDecks);
			alert("Publicにエクスポートしました。");
		} catch (e) {
			alert(e.message);
		}
	};

	const handleImportFromPublic = async (id) => {
		try {
			const userDecks = decks.filter((d) => d.ownerId === currentUser?.id);
			if (userDecks.length >= 999) {
				alert("デッキ数が上限(999)です。");
				return;
			}
			const deckToImport = decks.find((d) => d.id === id);
			const deckName = deckToImport ? deckToImport.name : "";
			if (!window.confirm(`このPublicデッキを取り込みますか？\n${deckName}`))
				return;
			const newDecks = await importDeckFromPublic(id, currentUser.id);
			setDecks(newDecks);
			alert("Publicからインポートしました。");
		} catch (e) {
			alert(e.message);
		}
	};

	const renderContent = () => {
		if (!currentUser) {
			return <UserSelectionScreen onSelectUser={setCurrentUser} />;
		}

		const displayedDecks = decks.filter(
			(d) => (d.ownerId || "public") === currentUser.id,
		);
		const publicDecks = decks.filter(
			(d) => (d.ownerId || "public") === "public",
		);

		const activeDeck = currentDeckId
			? decks.find((d) => d.id === currentDeckId) || {
					id: currentDeckId,
					name: "Not Found",
					cards: {},
					ownerId: currentUser.id,
				}
			: {
					id: tempDeckId || generateId(),
					name: "New Deck",
					cards: {},
					ownerId: currentUser.id,
				};

		if (isLoadingCards && cardData.length === 0) {
			return (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100vh",
						backgroundColor: "#1a1a1a",
						color: "white",
					}}
				>
					<h2>Loading Card Data...</h2>
				</div>
			);
		}

		return (
			<div className="App">
				{view === "lobby" && (
					<DeckLobby
						decks={displayedDecks}
						publicDecks={publicDecks}
						cards={cardData}
						onCreateNew={handleCreateNew}
						onSelectDeck={handleSelectDeck}
						onCopyDeck={handleCopyDeck}
						onDeleteDeck={handleDeleteDeck}
						onRenameDeck={handleRenameDeck}
						onExportToPublic={handleExportToPublic}
						onImportFromPublic={handleImportFromPublic}
						currentUser={currentUser}
						onChangeUser={() => setCurrentUser(null)}
					/>
				)}
				{view === "editor" && (
					<DeckEditor
						key={activeDeck.id}
						deck={activeDeck}
						cards={cardData}
						onSave={handleSaveDeck}
						onClose={handleCloseEditor}
						existingDeckNames={displayedDecks}
					/>
				)}
			</div>
		);
	};

	return renderContent();
}

export default App;
