import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
	AccordionContent,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from "./accordion";

const meta = {
	title: "UI/Accordion",
	component: AccordionRoot,
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
} satisfies Meta<typeof AccordionRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<AccordionRoot defaultValue={["item-1"]}>
			<AccordionItem value="item-1">
				<AccordionTrigger>Deck Options</AccordionTrigger>
				<AccordionContent>
					Elemental reactions and burst cards.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Export Settings</AccordionTrigger>
				<AccordionContent>
					Export as image bundle and JSON deck list.
				</AccordionContent>
			</AccordionItem>
		</AccordionRoot>
	),
};
