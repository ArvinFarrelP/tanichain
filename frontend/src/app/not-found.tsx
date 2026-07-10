import Link from 'next/link';
import { Leaf, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex items-center gap-2 font-display text-lg font-semibold text-muted-foreground">
        <Leaf className="h-5 w-5 text-primary" />
        TaniChain
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/40 text-muted-foreground">
        <MapPin className="h-8 w-8" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          This field doesn&apos;t exist on the farm. The page you&apos;re looking for may have moved or never existed.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/"><Button>Back to home</Button></Link>
        <Link href="/products"><Button variant="outline">Browse marketplace</Button></Link>
      </div>
    </main>
  );
}
