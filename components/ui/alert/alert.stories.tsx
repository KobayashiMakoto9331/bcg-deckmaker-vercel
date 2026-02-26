import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
	AlertCloseTrigger,
	AlertDescription,
	AlertRoot,
	AlertTitle,
} from "./alert";

const meta = {
	title: "UI/Alert",
	component: AlertRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="min-h-screen w-full max-w-2xl bg-[radial-gradient(120%_100%_at_50%_15%,#113b5e_0%,#04192d_55%,#020b16_100%)] p-10">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AlertRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<AlertRoot>
			<AlertCloseTrigger aria-label="Close alert" />
			<AlertTitle>Connection unstable</AlertTitle>
			<AlertDescription>
				Realtime sync is delayed. Deck changes are saved locally.
			</AlertDescription>
		</AlertRoot>
	),
};
