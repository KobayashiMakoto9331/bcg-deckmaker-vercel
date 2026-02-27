import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Frame } from "./frame";

const buttonVariants = cva(
	[
		"group font-bold mb-2 relative px-8 py-2 cursor-pointer outline-none transition-all duration-200 ease-out [&:hover_svg]:drop-shadow-xl",
		"[&>span]:relative [&>span]:flex [&>span]:items-center [&>span]:justify-center [&>span]:transition-all [&>span]:duration-200",
	],
	{
		variants: {
			variant: {
				default:
					"[--color-frame-1-stroke:var(--color-primary)] [--color-frame-1-fill:var(--color-primary)]/22 [--color-frame-2-stroke:var(--color-primary)] [--color-frame-2-fill:var(--color-primary)]/10 hover:[--color-frame-1-fill:var(--color-primary)]/34 hover:[--color-frame-2-fill:var(--color-primary)]/16 text-primary-foreground [&:hover_svg]:drop-shadow-primary/60 [&>span]:group-hover:[text-shadow:0_0_12px_var(--color-primary)]",
				accent:
					"[--color-frame-1-stroke:var(--color-accent)] [--color-frame-1-fill:var(--color-accent)]/40 [--color-frame-2-stroke:var(--color-accent)] [--color-frame-2-fill:var(--color-accent)]/20 hover:[--color-frame-1-fill:var(--color-accent)]/54 hover:[--color-frame-2-fill:var(--color-accent)]/28 text-accent-foreground [&:hover_svg]:drop-shadow-accent/60 [&>span]:group-hover:[text-shadow:0_0_12px_var(--color-accent)]",
				destructive:
					"[--color-frame-1-stroke:var(--color-destructive)] [--color-frame-1-fill:var(--color-destructive)]/22 [--color-frame-2-stroke:var(--color-destructive)] [--color-frame-2-fill:var(--color-destructive)]/10 hover:[--color-frame-1-fill:var(--color-destructive)]/34 hover:[--color-frame-2-fill:var(--color-destructive)]/16 text-destructive-foreground [&:hover_svg]:drop-shadow-destructive/60 [&>span]:group-hover:[text-shadow:0_0_12px_var(--color-destructive)]",
				secondary:
					"[--color-frame-1-stroke:var(--color-secondary)] [--color-frame-1-fill:var(--color-secondary)]/15 [--color-frame-2-stroke:var(--color-secondary)] [--color-frame-2-fill:var(--color-secondary)]/10 hover:[--color-frame-1-fill:var(--color-secondary)]/30 hover:[--color-frame-2-fill:var(--color-secondary)]/16 text-secondary-foreground [&:hover_svg]:drop-shadow-secondary/60 [&>span]:group-hover:[text-shadow:0_0_12px_var(--color-secondary)]",
				success:
					"[--color-frame-1-stroke:var(--color-success)] [--color-frame-1-fill:var(--color-success)]/22 [--color-frame-2-stroke:var(--color-success)] [--color-frame-2-fill:var(--color-success)]/10 hover:[--color-frame-1-fill:var(--color-success)]/34 hover:[--color-frame-2-fill:var(--color-success)]/16 text-success-foreground [&:hover_svg]:drop-shadow-success/60 [&>span]:group-hover:[text-shadow:0_0_12px_var(--color-success)]",
			},
			shape: {
				default: "",
				flat: "[--color-frame-2-stroke:transparent] [--color-frame-2-fill:transparent]",
				simple: "ps-8 pe-6",
				"tab-left": "",
				"tab-center": "",
				"tab-right": "",
			},
		},
		defaultVariants: {
			variant: "default",
			shape: "default",
		},
	},
);

function Button({
	className,
	children,
	variant = "default",
	shape = "default",
	customPaths,
	enableBackdropBlur,
	enableViewBox,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		customPaths?: string[];
		enableBackdropBlur?: boolean;
		enableViewBox?: boolean;
	}) {
	return (
		<button
			{...props}
			className={twMerge(buttonVariants({ variant, shape, className }))}
		>
			<div className="absolute inset-0 -mb-2">
				{!customPaths && (shape === "default" || shape === "flat") && (
					<Frame
						enableBackdropBlur={enableBackdropBlur}
						enableViewBox={enableViewBox}
						paths={JSON.parse(
							'[{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-1-stroke)","fill":"var(--color-frame-1-fill)"},"path":[["M","17","0"],["L","100% - 7","0"],["L","100% + 0","0% + 9.5"],["L","100% - 18","100% - 6"],["L","4","100% - 6"],["L","0","100% - 15"],["L","17","0"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-2-stroke)","fill":"var(--color-frame-2-fill)"},"path":[["M","9","100% - 6"],["L","100% - 22","100% - 6"],["L","100% - 25","100% + 0"],["L","12","100% + 0"],["L","9","100% - 6"]]}]',
						)}
					/>
				)}
				{!customPaths && shape === "simple" && (
					<Frame
						enableBackdropBlur={enableBackdropBlur}
						enableViewBox={enableViewBox}
						paths={JSON.parse(
							'[{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-1-stroke)","fill":"var(--color-frame-1-fill)"},"path":[["M","17","0"],["L","100% - 0","0"],["L","100% - 0","100% - 6"],["L","0% + 3","100% - 6"],["L","0% - 0","100% - 16"],["L","17","0"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-2-stroke)","fill":"var(--color-frame-2-fill)"},"path":[["M","8","100% - 6"],["L","100% - 5","100% - 6"],["L","100% - 7","100% - 0"],["L","10","100% - 0"],["L","8","100% - 6"]]}]',
						)}
					/>
				)}
				{customPaths?.map((customPath) => {
					return (
						<Frame
							key={customPath}
							enableBackdropBlur={enableBackdropBlur}
							enableViewBox={enableViewBox}
							paths={JSON.parse(customPath)}
						/>
					);
				})}
			</div>
			<span>{children}</span>
		</button>
	);
}

export { Button };
