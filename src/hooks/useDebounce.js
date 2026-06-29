import { useState, useEffect } from "react";

/**
 * Debounce a value by a given delay.
 * Useful for delaying search input processing.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in ms (default 300)
 * @returns The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
