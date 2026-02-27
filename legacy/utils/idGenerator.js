export const generateId = () => {
	// Try using native crypto.randomUUID
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		try {
			return crypto.randomUUID();
		} catch (_e) {
			console.warn(
				"crypto.randomUUID failed, falling back to manual generation",
			);
		}
	}

	// Fallback UUID v4 generator
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
