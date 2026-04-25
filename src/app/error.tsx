'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h2 className="text-2xl font-bold md:text-3xl">Something went wrong!</h2>
      <p className="max-w-md text-muted-foreground text-sm md:text-base">
        We encountered an error loading this page. This might be due to a temporary network issue or a problem with our servers.
      </p>
      <Button
        onClick={() => reset()}
        className="mt-4"
        variant="outline"
      >
        Try again
      </Button>
    </div>
  );
}
