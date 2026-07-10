'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled root-level error in TaniChain UI:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '1rem',
            textAlign: 'center',
            background: '#15100b',
            color: '#f2ede4',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>TaniChain hit an unexpected error</h1>
          <p style={{ color: '#a89f92', maxWidth: 420 }}>
            Something went wrong at the application level. Please try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#6ba33a',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
