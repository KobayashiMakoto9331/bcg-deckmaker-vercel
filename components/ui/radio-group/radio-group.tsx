"use client";

import {
	RadioGroupItem as CosmicRadioGroupItem,
	RadioGroupLabel as CosmicRadioGroupLabel,
	RadioGroupRoot as CosmicRadioGroupRoot,
	RadioItemControl as CosmicRadioItemControl,
	RadioItemHiddenInput as CosmicRadioItemHiddenInput,
	RadioItemText as CosmicRadioItemText,
} from "@/components/cosmic/radio-group";

type RadioGroupOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type RadioGroupProps = Omit<
	React.ComponentProps<typeof CosmicRadioGroupRoot>,
	"children"
> & {
	options: RadioGroupOption[];
	label?: React.ReactNode;
};

function RadioGroup({ options, label, ...rest }: RadioGroupProps) {
	return (
		<CosmicRadioGroupRoot {...rest}>
			{label ? <CosmicRadioGroupLabel>{label}</CosmicRadioGroupLabel> : null}
			{options.map((option) => (
				<CosmicRadioGroupItem
					key={option.value}
					value={option.value}
					disabled={option.disabled}
				>
					<CosmicRadioItemText>{option.label}</CosmicRadioItemText>
					<CosmicRadioItemControl>
						<CosmicRadioItemHiddenInput />
					</CosmicRadioItemControl>
				</CosmicRadioGroupItem>
			))}
		</CosmicRadioGroupRoot>
	);
}

export { RadioGroup, type RadioGroupOption, type RadioGroupProps };
export {
	RadioGroupItem,
	RadioGroupLabel,
	RadioGroupRoot,
	RadioItemControl,
	RadioItemHiddenInput,
	RadioItemText,
} from "@/components/cosmic/radio-group";
