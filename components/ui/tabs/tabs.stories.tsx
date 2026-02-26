import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./tabs";

const meta = {
	title: "UI/Tabs",
	component: TabsRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="min-h-screen w-full max-w-3xl bg-[radial-gradient(120%_100%_at_50%_15%,#113b5e_0%,#04192d_55%,#020b16_100%)] p-10">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof TabsRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<TabsRoot defaultValue="overview">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="cards">Cards</TabsTrigger>
				<TabsTrigger value="stats">Stats</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">General deck overview and key combos.</TabsContent>
			<TabsContent value="cards">Card list and rarity distribution.</TabsContent>
			<TabsContent value="stats">Damage curves and usage metrics.</TabsContent>
		</TabsRoot>
	),
};
