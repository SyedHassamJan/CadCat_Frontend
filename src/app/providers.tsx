'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,      // 5 min — data stays fresh longer
            gcTime: 10 * 60 * 1000,         // 10 min — keep in memory after unmount
            retry: 1,
            refetchOnWindowFocus: false,     // don't re-fetch when tab regains focus
            refetchOnReconnect: true,        // do re-fetch after offline → online
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
