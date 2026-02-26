"use client";

import { createListCollection } from "@ark-ui/react/collection";
import { useMemo, useState } from "react";

import {
	ComboboxContent as CosmicComboboxContent,
	ComboboxControl as CosmicComboboxControl,
	ComboboxInput as CosmicComboboxInput,
	ComboboxItem as CosmicComboboxItem,
	ComboboxItemGrouo as CosmicComboboxItemGrouo,
	ComboboxItemIndicator as CosmicComboboxItemIndicator,
	ComboboxItemText as CosmicComboboxItemText,
	ComboboxPositioner as CosmicComboboxPositioner,
	ComboboxRoot as CosmicComboboxRoot,
	ComboboxTrigger as CosmicComboboxTrigger,
} from "@/components/cosmic/combobox";

type CosmicComboboxRootProps = React.ComponentProps<typeof CosmicComboboxRoot>;

type ComboboxProps = Omit<CosmicComboboxRootProps, "children" | "collection"> & {
	items: string[];
	placeholder?: string;
};

function Combobox({
	items,
	placeholder = "Search...",
	value,
	defaultValue,
	onValueChange,
	...rest
}: ComboboxProps) {
	const collection = useMemo(() => createListCollection({ items }), [items]);
	const [internalValue, setInternalValue] = useState<string[]>(
		Array.isArray(defaultValue) ? defaultValue : [],
	);
	const currentValue = value ?? internalValue;

	return (
		<CosmicComboboxRoot
			{...rest}
			collection={collection}
			value={currentValue}
			onValueChange={(details) => {
				if (value === undefined) {
					setInternalValue(details.value);
				}
				onValueChange?.(details);
			}}
		>
			<CosmicComboboxControl>
				<CosmicComboboxTrigger />
			</CosmicComboboxControl>
			<CosmicComboboxPositioner>
				<CosmicComboboxContent>
					<CosmicComboboxInput placeholder={placeholder} />
					<CosmicComboboxItemGrouo>
						{collection.items.map((item) => (
							<CosmicComboboxItem key={item} item={item}>
								<CosmicComboboxItemText>{item}</CosmicComboboxItemText>
								<CosmicComboboxItemIndicator />
							</CosmicComboboxItem>
						))}
					</CosmicComboboxItemGrouo>
				</CosmicComboboxContent>
			</CosmicComboboxPositioner>
		</CosmicComboboxRoot>
	);
}

export {
	ComboboxRoot,
	ComboboxControl,
	ComboboxInput,
	ComboboxTrigger,
	ComboboxPositioner,
	ComboboxContent,
	ComboboxItemGrouo,
	ComboboxItem,
	ComboboxItemText,
	ComboboxItemIndicator,
} from "@/components/cosmic/combobox";

export { Combobox, type ComboboxProps };
