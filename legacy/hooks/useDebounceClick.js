import { useRef } from "react";

/**
 * Custom hook to prevent rapid button clicks
 * @param {Function} callback - The function to execute on click
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} - Debounced click handler
 */
export const useDebounceClick = (callback, delay = 300) => {
	const lastClickTime = useRef(0);

	return (...args) => {
		const now = Date.now();
		if (now - lastClickTime.current >= delay) {
			lastClickTime.current = now;
			callback(...args);
		}
	};
};
