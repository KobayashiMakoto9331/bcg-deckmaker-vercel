import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Chart } from "./chart";

const meta = {
	title: "UI/Chart",
	component: Chart,
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
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
	args: {
		className: "h-80 w-[560px]",
		config: {
			type: "line",
			data: {
				labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
				datasets: [
					{
						label: "Deck saves",
						data: [4, 7, 5, 10, 8],
						borderColor: "#00c8ff",
						backgroundColor: "rgba(0,200,255,0.25)",
						tension: 0.35,
						fill: true,
					},
				],
			},
			options: {
				plugins: {
					legend: { display: false },
				},
				scales: {
					x: {
						grid: { color: "rgba(255,255,255,0.08)" },
						ticks: { color: "#c8ecff" },
					},
					y: {
						grid: { color: "rgba(255,255,255,0.08)" },
						ticks: { color: "#c8ecff" },
					},
				},
			},
		},
	},
};
