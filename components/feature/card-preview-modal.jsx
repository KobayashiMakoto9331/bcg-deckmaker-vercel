"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import {
	DialogBackdrop,
	DialogCloseTrigger,
	DialogContent,
	DialogPositioner,
	DialogRoot,
	Portal,
} from "@/components/ui/dialog/dialog";

const CardPreviewModal = ({ card, open, onOpenChange }) => {
	const [showDetails, setShowDetails] = useState(false);
	if (!card) return null;

	return (
		<DialogRoot open={open} onOpenChange={onOpenChange}>
			<Portal>
				<DialogBackdrop className="bg-black/70" />
				<DialogPositioner>
					<DialogContent className="p-8 [--color-frame-1-fill:transparent] [--color-frame-2-fill:transparent] [--color-frame-3-fill:transparent] [--color-frame-4-fill:transparent] [--color-frame-5-fill:transparent] backdrop-blur-none">
						<DialogCloseTrigger />
						{!showDetails ? (
							<>
								<Image
									src={card.image}
									alt={card.name}
									width={400}
									height={560}
									className="block h-auto max-h-[90vh] w-auto max-w-full rounded-xl object-contain"
								/>
								<Button
									shape="flat"
									onClick={() => setShowDetails(true)}
									className="absolute right-0 bottom-0"
								>
									detail
								</Button>
							</>
						) : (
							<div className="min-h-[50vh] max-h-[90vh] w-full min-w-[400px] p-6 overflow-y-auto rounded-xl bg-linear-to-br from-primary/10 to-accent/5 backdrop-blur-sm border border-primary/30">
								<Button
									shape="flat"
									onClick={() => setShowDetails(false)}
									className="absolute right-2 top-2 px-4 py-1.5"
								>
									BACK
								</Button>
								<div className="relative mb-4 border-b border-primary/30 pb-2">
									<div className="text-2xl font-bold text-shadow-lg text-shadow-primary text-white">
										{card.name}
									</div>
								</div>
								{card.text && (
									<div className="relative whitespace-pre-wrap leading-[1.4] opacity-90 text-white">
										{card.text}
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</DialogPositioner>
			</Portal>
		</DialogRoot>
	);
};

export default CardPreviewModal;
