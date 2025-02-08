"use client";

import { FC, ReactNode } from "react";

const client = new QueryClient();

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const ClientProviders: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </>
  );
};
