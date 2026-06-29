import { useState, useRef, useCallback } from "react";

/**
 * Hook for safe form submission with double-click protection.
 * Guarantees only one submission at a time regardless of rapid clicks.
 *
 * @param {Function} submitFn - Async function to execute on submit.
 *   Receives form data as argument. Should return a result or throw on error.
 * @param {Object} options
 * @param {Function} options.onSuccess - Called after successful submission
 * @param {Function} options.onError - Called if submitFn throws
 * @returns {{ isSubmitting, error, handleSubmit }}
 */
export function useFormSubmit(submitFn, { onSuccess, onError } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const lockRef = useRef(false);

  const handleSubmit = useCallback(
    async (data) => {
      // Hard lock: prevents re-entry even if React hasn't re-rendered yet
      if (lockRef.current) return;
      lockRef.current = true;
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await submitFn(data);
        if (onSuccess) onSuccess(result);
      } catch (err) {
        const message = err?.message || "Ocurrió un error al guardar.";
        setError(message);
        if (onError) onError(err);
      } finally {
        setIsSubmitting(false);
        lockRef.current = false;
      }
    },
    [submitFn, onSuccess, onError]
  );

  return { isSubmitting, error, handleSubmit };
}
