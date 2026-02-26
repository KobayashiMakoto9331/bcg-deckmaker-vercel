"use client";

import { useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { type Paths, setupSvgRenderer } from "@left4code/svg-renderer";

function Frame({
	className,
	paths,
	enableBackdropBlur,
	enableViewBox,
	...props
}: {
	paths: Paths;
	enableBackdropBlur?: boolean;
	enableViewBox?: boolean;
} & React.ComponentProps<"svg">) {
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		const el = svgRef.current;
		if (el?.parentElement) {
			const instance = setupSvgRenderer({
				el,
				paths,
				enableBackdropBlur,
				enableViewBox,
			});

			return () => instance.destroy();
		}
	}, [paths, enableBackdropBlur, enableViewBox]);

	return (
		<svg
			{...props}
			className={twMerge(["absolute inset-0 size-full", className])}
			xmlns="http://www.w3.org/2000/svg"
			ref={svgRef}
		/>
	);
}

export { Frame };
