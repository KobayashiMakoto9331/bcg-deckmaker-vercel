import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Combobox } from "./combobox";

const items = ["Amber", "Diluc", "Fischl", "Keqing", "Xingqiu", "Yelan"];

const meta = {
	title: "UI/Combobox",
	component: Combobox,
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
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		items,
		defaultValue: ["Amber"],
		placeholder: "Search character...",
	},
	render: (args) => <Combobox {...args} />,
};
