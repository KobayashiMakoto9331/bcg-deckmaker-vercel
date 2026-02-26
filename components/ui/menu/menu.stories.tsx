import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Archive, Share2, Trash2 } from "lucide-react";

import { Menu } from "./menu";

const meta = {
	title: "UI/Menu",
	component: Menu,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="min-h-screen w-full bg-[radial-gradient(120%_100%_at_50%_15%,#113b5e_0%,#04192d_55%,#020b16_100%)] p-10">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomActions: Story = {
	args: {
		label: "Deck Actions",
		actions: [
			{ value: "archive", label: "Archive", icon: Archive },
			{ value: "share", label: "Share", icon: Share2 },
			{ value: "delete", label: "Delete", icon: Trash2 },
		],
	},
};
