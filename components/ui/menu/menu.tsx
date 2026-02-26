"use client";

import { CopySlash, Eraser, FilePenLine, FileUp, PenLine } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { twMerge } from "tailwind-merge";

import {
	MenuContent,
	MenuItem,
	MenuPositioner,
	MenuRoot,
	MenuTrigger,
} from "@/components/cosmic/menu";

type MenuIcon = ComponentType<SVGProps<SVGSVGElement>>;

type MenuAction = {
	value: string;
	label: string;
	icon?: MenuIcon;
	disabled?: boolean;
};

type MenuProps = {
	label?: string;
	actions?: MenuAction[];
	className?: string;
	contentClassName?: string;
	onActionSelect?: (value: string) => void;
};

const defaultActions: MenuAction[] = [
	{ value: "edit", label: "Edit", icon: FilePenLine },
	{ value: "duplicate", label: "Duplicate", icon: CopySlash },
	{ value: "delete", label: "Delete", icon: Eraser },
	{ value: "export", label: "Export...", icon: FileUp },
];

function Menu({
	label = "Actions",
	actions = defaultActions,
	className,
	contentClassName,
	onActionSelect,
}: MenuProps) {
	return (
		<MenuRoot>
			<MenuTrigger className={twMerge(["w-56", className])}>
				<PenLine className="size-4 me-2.5" />
				{label}
			</MenuTrigger>
			<MenuPositioner>
				<MenuContent className={contentClassName}>
					{actions.map((action) => {
						const Icon = action.icon;
						return (
							<MenuItem
								key={action.value}
								value={action.value}
								disabled={action.disabled}
								onSelect={() => onActionSelect?.(action.value)}
							>
								{Icon ? <Icon className="size-4 me-2.5" /> : null}
								{action.label}
							</MenuItem>
						);
					})}
				</MenuContent>
			</MenuPositioner>
		</MenuRoot>
	);
}

export { Menu, type MenuAction, type MenuProps };
