"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
	const [isWideLayout, setIsWideLayout] = useState(false);

	useEffect(() => {
		if (!open) setShowDetails(false);
	}, [open]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(min-width: 667px)");
		const updateLayout = () => setIsWideLayout(mediaQuery.matches);
		updateLayout();
		mediaQuery.addEventListener("change", updateLayout);
		return () => mediaQuery.removeEventListener("change", updateLayout);
	}, []);

	if (!card) return null;

	return (
		<DialogRoot open={open} onOpenChange={onOpenChange}>
			<Portal>
				<DialogBackdrop className="bg-black/70" />
				<DialogPositioner className="fixed inset-0 z-2000 flex items-center justify-center p-2 sm:p-4">
					<DialogContent className="top-auto! left-auto! translate-x-0! translate-y-0! relative w-[90vw]! max-w-[90vw]! overflow-hidden p-2 sm:p-4 [--color-frame-1-fill:transparent] [--color-frame-2-fill:transparent] [--color-frame-3-fill:transparent] [--color-frame-4-fill:transparent] [--color-frame-5-fill:transparent] backdrop-blur-none">
						<DialogCloseTrigger />
						{isWideLayout ? (
							<div className="flex w-full min-w-0 items-stretch justify-start">
								<div className="relative flex w-[clamp(260px,38vw,520px)] shrink-0 items-start justify-start">
									<Image
										src={card.image}
										alt={card.name}
										width={520}
										height={728}
										className="block h-auto max-h-[84vh] w-full rounded-xl object-contain"
									/>
								</div>
								<div className="max-h-[84vh] min-w-0 w-0 flex-1 overflow-y-auto rounded-lg bg-black/30 p-3 sm:p-4">
									<div className="relative mb-3 pb-1">
										<div className="text-lg font-bold text-[#e7f8ff] [text-shadow:0_0_6px_rgba(90,190,255,0.9),0_0_18px_rgba(20,160,230,0.75)] sm:text-xl">
											{card.name}
										</div>
									</div>
									<div className="relative whitespace-pre-wrap leading-[1.6] text-[#e9f7ff] [text-shadow:0_0_4px_rgba(90,190,255,0.75),0_0_12px_rgba(20,160,230,0.45)]">
										{card.text || "テキスト情報なし"}
									</div>
								</div>
							</div>
						) : !showDetails ? (
							<div className="relative flex items-center justify-center">
								<Image
									src={card.image}
									alt={card.name}
									width={400}
									height={560}
									className="block h-auto max-h-[82vh] w-auto max-w-full rounded-xl object-contain [@media(orientation:landscape)_and_(max-height:560px)]:max-h-[72vh]"
								/>
								<Button
									shape="flat"
									onClick={() => setShowDetails(true)}
									className="absolute right-1 bottom-1 sm:right-2 sm:bottom-2"
								>
									detail
								</Button>
							</div>
						) : (
							<div className="max-h-[82vh] w-full min-w-0 overflow-y-auto rounded-xl border border-primary/30 bg-linear-to-br from-primary/10 to-accent/5 p-4 sm:p-6 backdrop-blur-sm [@media(orientation:landscape)_and_(max-height:560px)]:max-h-[72vh]">
								<Button
									shape="flat"
									onClick={() => setShowDetails(false)}
									className="sticky top-0 ml-auto mb-2 block px-4 py-1.5"
								>
									Back
								</Button>
								<div className="relative mb-4 border-b border-primary/30 pb-2">
									<div className="text-xl font-bold text-[#e7f8ff] [text-shadow:0_0_6px_rgba(90,190,255,0.9),0_0_18px_rgba(20,160,230,0.75)] sm:text-2xl">
										{card.name}
									</div>
								</div>
								{card.text && (
									<div className="relative whitespace-pre-wrap leading-[1.4] text-[#e9f7ff] [text-shadow:0_0_4px_rgba(90,190,255,0.75),0_0_12px_rgba(20,160,230,0.45)]">
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
