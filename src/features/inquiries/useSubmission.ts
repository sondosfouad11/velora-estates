import { useCallback, useState } from 'react';
import { ApiError } from '../../services/http';
import type { FieldErrors } from '../../utils/validation';

export type SubmitState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'success'; message: string; id: number }
  | { phase: 'error'; message: string };

/**
 * Shared form submission flow: client validation first, then the API call;
 * server-side field errors are merged into the same error map the form displays.
 */
export function useSubmission<V>(validate: (values: V) => FieldErrors, send: (values: V) => Promise<{ id: number; message: string }>) {
  const [state, setState] = useState<SubmitState>({ phase: 'idle' });
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = useCallback(
    async (values: V) => {
      const clientErrors = validate(values);
      setErrors(clientErrors);
      if (Object.keys(clientErrors).length) {
        setState({ phase: 'error', message: 'Check the highlighted fields.' });
        // Move focus to the first invalid field for keyboard and screen-reader users.
        requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }
      setState({ phase: 'submitting' });
      try {
        const result = await send(values);
        setState({ phase: 'success', message: result.message, id: result.id });
      } catch (err) {
        if (err instanceof ApiError) {
          setErrors(err.fields);
          setState({ phase: 'error', message: err.status === 429 ? err.message : Object.keys(err.fields).length ? 'Check the highlighted fields.' : err.message });
        } else {
          setState({ phase: 'error', message: 'Your message could not be sent. Try again in a moment.' });
        }
      }
    },
    [validate, send],
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState({ phase: 'idle' });
    setErrors({});
  }, []);

  return { state, errors, submit, clearError, reset };
}
