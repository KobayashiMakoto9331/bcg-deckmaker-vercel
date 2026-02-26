import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Frame } from "./frame";

const meta = {
	title: "UI/Frame",
	component: Frame,
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
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WarmAccent: Story = {
	args: {
		style: {
			"--color-primary": "#00d1ff",
			"--color-accent": "#ff6b3d",
		} as React.CSSProperties,
	},
};
