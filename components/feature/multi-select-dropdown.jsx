import { useEffect, useRef, useState } from "react";

const MultiSelectDropdown = ({ label, options, selected, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleOption = (option) => {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else {
			onChange([...selected, option]);
		}
	};

	return (
		<div ref={containerRef} className="relative flex-[1_0_auto]">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`flex w-full items-center justify-between rounded border bg-[rgba(18,34,56,0.8)] px-3 py-1.5 text-left text-[0.9em] transition-colors ${
					selected.length > 0
						? "border-[#63d6ff] text-white"
						: "border-[rgba(123,190,255,0.2)] text-[#aaa]"
				}`}
			>
				<span className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap">
					{selected.length > 0 ? `${label}: ${selected.length}` : label}
				</span>
				<span className="ml-2 text-[0.7em]">▼</span>
			</button>

			{isOpen && (
				<div className="feature-modal-panel absolute left-0 top-full z-1000 mt-1 flex max-h-[300px] min-w-full w-max max-w-[300px] flex-col overflow-hidden rounded">
					<div className="flex shrink-0 items-center justify-between border-b border-[rgba(123,190,255,0.2)] p-2">
						<span className="text-[0.8em] text-[#a5c3e0]">
							{options.length} items
						</span>
						<div className="flex gap-4">
							<button
								type="button"
								onClick={() => onChange([])}
								className="cursor-pointer border-none bg-none p-0 text-[0.8em] text-[#ff7b8f]"
							>
								Clear All
							</button>
							<button
								type="button"
								onClick={() => onChange(options)}
								className="cursor-pointer border-none bg-none p-0 text-[0.8em] text-[#6ce5b0]"
							>
								Select All
							</button>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="cursor-pointer border-none bg-none p-0 text-[0.8em] text-[#63d6ff]"
							>
								Close
							</button>
						</div>
					</div>
					<div className="flex flex-col gap-1 overflow-y-auto p-2">
						{options.map((option) => (
							<label
								key={option}
								className={`flex cursor-pointer items-center gap-2 rounded p-1 transition-colors hover:bg-[rgba(82,137,190,0.28)] ${
									selected.includes(option)
										? "bg-[rgba(82,137,190,0.28)]"
										: "bg-transparent"
								}`}
							>
								<input
									type="checkbox"
									checked={selected.includes(option)}
									onChange={() => toggleOption(option)}
									className="accent-[#63d6ff]"
								/>
								<span className="text-[0.9em] text-[#d8e9f8]">{option}</span>
							</label>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default MultiSelectDropdown;
