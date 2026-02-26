"use client";

import { twMerge } from "tailwind-merge";

import { Button as CosmicButton } from "@/components/cosmic/button";

type ButtonProps = React.ComponentProps<typeof CosmicButton>;

function Button({ className, ...props }: ButtonProps) {
	return (
		<CosmicButton
			className={twMerge(["[&>span]:tracking-wide", className])}
			{...props}
		/>
	);
}

export { Button, type ButtonProps };
