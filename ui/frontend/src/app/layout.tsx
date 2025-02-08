import "@/styles/index.css";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { cookieToInitialState } from "wagmi";

import { ClientProviders } from "@/components/ClientProviders";
import { Analytics } from "@/components/common/Analytics";
import { MetaDescription, MetaTitle } from "@/lib/content/meta";
import { cn } from "@/lib/utils";
import { config } from "@/lib/WagmiConfig";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const url = "https://edunai.com";

export const metadata: Metadata = {
  title: MetaTitle,
  description: MetaDescription,

  metadataBase: new URL(url),
  openGraph: {
    url: url,
  },
  alternates: {
    canonical: url,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground")}>
        <ClientProviders initialState={initialState}>
          {children}

          <Analytics />
        </ClientProviders>
      </body>
    </html>
  );
}
