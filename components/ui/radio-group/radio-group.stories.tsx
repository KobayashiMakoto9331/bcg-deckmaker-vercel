import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RadioGroup } from "./radio-group";

const options = [
	{ value: "standard", label: "Standard" },
	{ value: "aggressive", label: "Aggressive" },
	{ value: "control", label: "Control" },
];

const meta = {
	title: "UI/Radio Group",
	component: RadioGroup,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="min-h-screen w-full max-w-xl bg-[radial-gradient(120%_100%_at_50%_15%,#113b5e_0%,#04192d_55%,#020b16_100%)] p-10">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: "Play Style",
		options,
		defaultValue: "standard",
	},
};
