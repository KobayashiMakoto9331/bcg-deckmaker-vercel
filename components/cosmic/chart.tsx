import ChartJs from "chart.js/auto";
import { useEffect, useRef } from "react";

function getColor(name: string, opacity = 1) {
	const color = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	if (opacity < 1) {
		return `color-mix(in oklch, ${color} ${opacity * 100}%, transparent ${
			100 - opacity * 100
		}%)`;
	}
	return color;
}

function Chart({
	className,
	config,
	...props
}: React.ComponentProps<"canvas"> & {
	config: ConstructorParameters<typeof ChartJs>[1];
}) {
	const chartRef = useRef<
		HTMLCanvasElement & {
			instance?: unknown;
		}
	>(null);

	useEffect(() => {
		if (chartRef.current && !chartRef.current.instance) {
			chartRef.current.instance = new ChartJs(chartRef.current, config);
		}
	}, [config]);

	return <canvas className={className} ref={chartRef} {...props} />;
}

export { Chart, getColor };
