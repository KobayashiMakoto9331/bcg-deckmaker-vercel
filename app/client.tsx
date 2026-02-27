"use client";

import dynamic from "next/dynamic";

const FeatureApp = dynamic(() => import("@/components/feature/app"), {
	ssr: false,
});

export function ClientOnly() {
	return <FeatureApp />;
}
