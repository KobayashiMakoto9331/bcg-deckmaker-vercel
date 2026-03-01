"use client";

import { twMerge } from "tailwind-merge";
import {
	ToastRoot as CosmicToastRoot,
	ToastTitle as CosmicToastTitle,
	createToaster,
	ToastCloseTrigger,
	ToastDescription,
	Toaster,
} from "@/components/cosmic/toast";

type Tone = "error" | "success" | "default";

const resolveTone = (toastType?: string): Tone => {
	if (toastType === "error") return "error";
	if (toastType === "success") return "success";
	return "default";
};

type ToastRootProps = React.ComponentProps<typeof CosmicToastRoot> & {
	toastType?: string;
};

function ToastRoot({ toastType, className, ...rest }: ToastRootProps) {
	const tone = resolveTone(toastType);
	const toneClass =
		tone === "error"
			? "[--color-frame-1-stroke:var(--color-destructive)] [--color-frame-1-fill:var(--color-destructive)]/25 [--color-frame-2-stroke:var(--color-destructive)] [--color-frame-2-fill:var(--color-destructive)]/20 [--color-frame-3-stroke:var(--color-destructive)] [--color-frame-3-fill:var(--color-destructive)]/45"
			: tone === "success"
				? "[--color-frame-1-stroke:var(--color-success)] [--color-frame-1-fill:var(--color-success)]/25 [--color-frame-2-stroke:var(--color-success)] [--color-frame-2-fill:var(--color-success)]/20 [--color-frame-3-stroke:var(--color-success)] [--color-frame-3-fill:var(--color-success)]/45"
				: "";
	return (
		<CosmicToastRoot className={twMerge(toneClass, className)} {...rest} />
	);
}

type ToastTitleProps = React.ComponentProps<typeof CosmicToastTitle> & {
	toastType?: string;
};

function ToastTitle({ toastType, className, ...rest }: ToastTitleProps) {
	const tone = resolveTone(toastType);
	const toneClass =
		tone === "error"
			? "text-red-100 [text-shadow:0_0_10px_rgba(244,63,94,0.9)]"
			: tone === "success"
				? "text-emerald-100 [text-shadow:0_0_10px_rgba(20,184,166,0.85)]"
				: "";
	return (
		<CosmicToastTitle className={twMerge(toneClass, className)} {...rest} />
	);
}

export {
	createToaster,
	ToastCloseTrigger,
	ToastDescription,
	Toaster,
	ToastRoot,
	ToastTitle,
};
