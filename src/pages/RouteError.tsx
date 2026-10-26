import { isRouteErrorResponse, useRouteError } from 'react-router';
import { StatePanel } from '../components/ui/StatePanel';
import { Button } from '../components/ui/Button';

/** Last-resort boundary for unexpected render errors, so a crash never shows a blank page. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'Unknown error';
  // Stale lazy chunks after a redeploy: a reload fetches the new build.
  const isChunkError = /dynamically imported module|Importing a module script failed/i.test(message);
  return (
    <div className="container" style={{ paddingBlock: '8rem 4rem' }}>
      <StatePanel
        tone="error"
        title={isChunkError ? 'A newer version is available' : 'This page could not be displayed'}
        action={
          <>
            <Button onClick={() => window.location.reload()}>Reload the page</Button>
            <a href="/" style={{ alignSelf: 'center' }}>
              Go to the home page
            </a>
          </>
        }
      >
        <p>{isChunkError ? 'Reload to load the latest files.' : `Error details: ${message}`}</p>
      </StatePanel>
    </div>
  );
}
