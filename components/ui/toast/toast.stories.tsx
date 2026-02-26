import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button/button";

import {
	createToaster,
	ToastCloseTrigger,
	ToastDescription,
	ToastRoot,
	ToastTitle,
	Toaster,
} from "./toast";

const toaster = createToaster({
	placement: "top-end",
	pauseOnPageIdle: true,
	max: 3,
});

const meta = {
	title: "UI/Toast",
	component: ToastRoot,
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
} satisfies Meta<typeof ToastRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: () => (
		<>
			<Button
				onClick={() =>
					toaster.create({
						title: "Deck saved",
						description: "Your latest lineup has been stored.",
					})
				}
			>
				Show Toast
			</Button>
			<Toaster toaster={toaster}>
				{(toast) => (
					<ToastRoot key={toast.id}>
						<ToastCloseTrigger aria-label="Close toast" />
						<ToastTitle>{toast.title}</ToastTitle>
						<ToastDescription>{toast.description}</ToastDescription>
					</ToastRoot>
				)}
			</Toaster>
		</>
	),
};
