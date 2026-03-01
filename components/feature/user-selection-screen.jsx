import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { getUsers } from "@/legacy/utils/storage";

const UserSelectionScreen = ({ onSelectUser }) => {
	const [users, setUsers] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState(null);

	useEffect(() => {
		getUsers().then(setUsers);
	}, []);

	return (
		<div className="user-selection-container relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,#1e3a8a_0%,#0f172a_50%,#020617_100%)]">
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
				<div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] animate-pulse rounded-full bg-cyan-500/10 blur-3xl animation-delay-2000" />
				<div className="absolute bottom-1/4 left-1/3 h-[600px] w-[600px] animate-pulse rounded-full bg-purple-500/10 blur-3xl animation-delay-4000" />
			</div>

			<div className="user-selection-card relative mx-auto max-w-2xl backdrop-blur-sm">
				{/* Futuristic title */}
				<div className="mb-12 text-center">
					<h1 className="m-0 mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-6xl font-bold tracking-wider text-transparent">
						SATISFACTION-GCG
					</h1>
					<div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
				</div>

				{/* User grid */}
				<div className="mb-8 grid grid-cols-2 gap-3">
					{users.map((user) => (
						<Button
							key={user.id}
							type="button"
							onClick={() => setSelectedUserId(user.id)}
							selected={selectedUserId === user.id}
							className="min-h-[60px] w-full text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
						>
							{user.name}
						</Button>
					))}
				</div>

				{/* Action button */}
				<Button
					disabled={!selectedUserId}
					onClick={() => {
						const user = users.find((u) => u.id === selectedUserId);
						if (user) onSelectUser(user);
					}}
					className="h-14 w-full text-lg font-bold  transition-all duration-300 hover:scale-[1.02]"
					variant="success"
				>
					START SESSION
				</Button>
			</div>
		</div>
	);
};

export default UserSelectionScreen;
