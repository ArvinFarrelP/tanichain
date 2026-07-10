'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Leaf, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error in TaniChain UI:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex items-center gap-2 font-display text-lg font-semibold text-muted-foreground">
        <Leaf className="h-5 w-5 text-primary" />
        TaniChain
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error occurred while rendering this page. You can try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/dashboard"><Button variant="outline">Back to dashboard</Button></Link>
      </div>
    </main>
  );
}
