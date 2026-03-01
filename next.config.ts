import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.gundam-gcg.com",
			},
			{
				protocol: "https",
				hostname: "**.supabase.co",
			},
		],
	},
};

export default nextConfig;
