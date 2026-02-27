import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { generateId } from "@/legacy/utils/idGenerator";
import {
	deleteUser,
	getDisplayLength,
	getUsers,
	saveUser,
} from "@/legacy/utils/storage";

const UserSelectionScreen = ({ onSelectUser }) => {
	const [users, setUsers] = useState([]);
	const [newUserName, setNewUserName] = useState("");
	const [error, setError] = useState("");
	const [editingUserId, setEditingUserId] = useState(null);
	const [editName, setEditName] = useState("");
	const [selectedUserId, setSelectedUserId] = useState(null);

	useEffect(() => {
		getUsers().then(setUsers);
	}, []);

	const handleCreateUser = async () => {
		if (!newUserName.trim()) return;
		if (users.length >= 10) {
			setError("ユーザーの上限は10です。");
			return;
		}
		if (getDisplayLength(newUserName.trim()) > 30) {
			setError("ユーザー名の上限は全角15文字です。");
			return;
		}
		try {
			const newUser = { id: generateId(), name: newUserName.trim() };
			const updated = await saveUser(newUser);
			setUsers(updated);
			setNewUserName("");
			setError("");
		} catch (e) {
			setError(e.message);
		}
	};

	const handleDeleteUser = async (id) => {
		if (selectedUserId === id) setSelectedUserId(null);
		if (
			!window.confirm(
				"このユーザーと紐づくデッキが削除されますが、削除してよろしいですか？",
			)
		)
			return;
		try {
			const updated = await deleteUser(id);
			setUsers(updated);
			setError("");
		} catch (e) {
			setError(e.message);
		}
	};

	const handleUpdateUser = async () => {
		if (getDisplayLength(editName.trim()) > 30) {
			setError("ユーザー名の上限は全角15文字です。");
			return;
		}
		try {
			const updated = await saveUser({
				id: editingUserId,
				name: editName.trim(),
			});
			setUsers(updated);
			setEditingUserId(null);
			setEditName("");
			setError("");
		} catch (e) {
			setError(e.message);
		}
	};

	return (
		<div className="user-selection-container">
			<div className="user-selection-card">
				<h1 className="m-0 mb-2 text-center text-5xl text-[#63d6ff]">
					Satisfaction-GCG
				</h1>
				{error && (
					<div className="mb-4 rounded border border-[rgba(255,114,132,0.45)] bg-[rgba(92,24,30,0.62)] p-2 text-center text-[#ff8e8e]">
						{error}
					</div>
				)}
				<div className="mb-4 grid grid-cols-2 gap-2">
					{users.map((user) =>
						editingUserId === user.id ? (
							<div
								key={user.id}
								className={`feature-card flex min-h-[25px] items-center justify-center rounded border px-2 py-1.5 ${
									selectedUserId === user.id
										? "border-2 border-[#63d6ff] bg-[rgba(45,69,104,0.86)]"
										: "border-[rgba(123,190,255,0.2)]"
								}`}
							>
								<div className="flex w-full gap-2">
									<Input
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										autoFocus
									/>
									<Button onClick={handleUpdateUser}>Save</Button>
									<Button onClick={() => setEditingUserId(null)}>Cancel</Button>
								</div>
							</div>
						) : (
							<Button
								key={user.id}
								type="button"
								onClick={() => setSelectedUserId(user.id)}
							>
								{user.name}
							</Button>
						),
					)}
				</div>
				<Button
					disabled={!selectedUserId}
					onClick={() => {
						const user = users.find((u) => u.id === selectedUserId);
						if (user) onSelectUser(user);
					}}
					className="mb-2 w-full"
				>
					OK
				</Button>

				<div className="flex gap-2">
					<Button
						disabled={
							!selectedUserId ||
							users.find((u) => u.id === selectedUserId)?.isReadOnly
						}
						onClick={() => {
							const user = users.find((u) => u.id === selectedUserId);
							if (user) {
								setEditingUserId(user.id);
								setEditName(user.name);
								setError("");
							}
						}}
						className="flex-1"
					>
						Rename
					</Button>
					<Button
						disabled={
							!selectedUserId ||
							users.find((u) => u.id === selectedUserId)?.isReadOnly
						}
						onClick={() => selectedUserId && handleDeleteUser(selectedUserId)}
						className="flex-1"
					>
						Delete
					</Button>
				</div>

				<div className="flex gap-2 pt-4">
					<Input
						placeholder="New User Name"
						value={newUserName}
						onChange={(e) => setNewUserName(e.target.value)}
						className="flex-1"
					/>
					<Button onClick={handleCreateUser} disabled={!newUserName}>
						Create
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserSelectionScreen;
