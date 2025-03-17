"use client";

import { QueryClient } from "@tanstack/query-core";
import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

type Props = {
  children: ReactNode;
}

export const QueryProvider = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};