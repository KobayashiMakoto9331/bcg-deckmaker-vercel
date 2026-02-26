import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
	SwitchControl,
	SwitchHiddenInput,
	SwitchLabel,
	SwitchRoot,
	SwitchThumb,
} from "./switch";

const meta = {
	title: "UI/Switch",
	component: SwitchRoot,
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
} satisfies Meta<typeof SwitchRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<SwitchRoot defaultChecked>
			<SwitchLabel>Enable deck auto-save</SwitchLabel>
			<SwitchHiddenInput />
			<SwitchControl>
				<SwitchThumb />
			</SwitchControl>
		</SwitchRoot>
	),
};
