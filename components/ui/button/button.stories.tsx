import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus } from "lucide-react";

import { Button } from "./button";

const variants = [
	"default",
	"accent",
	"destructive",
	"secondary",
	"success",
] as const;

const meta = {
	title: "UI/Button",
	component: Button,
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
	args: {
		children: "Create Deck",
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AccentFlat: Story = {
	args: {
		variant: "accent",
		shape: "flat",
		children: (
			<>
				<Plus className="size-4" />
				Quick Add
			</>
		),
	},
};

export const AllVariants: Story = {
	render: (args) => (
		<div className="grid gap-3 sm:grid-cols-2">
			{variants.map((variant) => (
				<Button key={variant} {...args} variant={variant}>
					{variant}
				</Button>
			))}
		</div>
	),
	args: {
		shape: "default",
	},
};
