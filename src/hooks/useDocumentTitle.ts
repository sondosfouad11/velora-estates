import { useEffect } from 'react';

const SUFFIX = 'VELORA ESTATES';

export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    if (title === undefined) return;
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Homes on the Costa Verenna`;
  }, [title]);
}
