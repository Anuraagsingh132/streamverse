'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

/**
 * ClientOnly component that renders its children only on the client-side
 * This helps prevent hydration errors by ensuring client-specific code never runs during server-side rendering
 */
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
