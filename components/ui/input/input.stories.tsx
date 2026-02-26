import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta = {
	title: "UI/Input",
	component: Input,
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
	args: {
		placeholder: "Deck name",
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		defaultValue: "Hyperbloom Control",
	},
};
