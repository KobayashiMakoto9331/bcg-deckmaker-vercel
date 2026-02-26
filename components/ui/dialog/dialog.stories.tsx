import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
	DialogBackdrop,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogPositioner,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
	Portal,
} from "./dialog";

const meta = {
	title: "UI/Dialog",
	component: DialogRoot,
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
} satisfies Meta<typeof DialogRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<DialogRoot>
			<DialogTrigger>Open Deck Details</DialogTrigger>
			<Portal>
				<DialogBackdrop />
				<DialogPositioner>
					<DialogContent>
						<DialogCloseTrigger aria-label="Close dialog" />
						<DialogTitle>Deck Configuration</DialogTitle>
						<DialogDescription>
							Choose your active lineup and elemental resonance.
						</DialogDescription>
					</DialogContent>
				</DialogPositioner>
			</Portal>
		</DialogRoot>
	),
};
