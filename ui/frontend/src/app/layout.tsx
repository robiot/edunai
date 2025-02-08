import "@/styles/index.css";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ReactNode } from "react";

import { ClientProviders } from "@/components/ClientProviders";
import { Analytics } from "@/components/common/Analytics";
import { MetaDescription, MetaTitle } from "@/lib/content/meta";
import { cn } from "@/lib/utils";

const inter = Outfit({
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
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground")}>
        <ClientProviders>
          {children}

          <Analytics />
        </ClientProviders>
      </body>
    </html>
  );
}
