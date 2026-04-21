"use client";

import "./globals.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/config";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head>
        <title>Celo High Shot 🎯</title>
        <meta name="description" content="Higher or lower? Predict and win CELO!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* MiniPay / MiniApp meta tags */}
        <meta name="theme-color" content="#1E1E2E" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
