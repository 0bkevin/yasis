"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, lightTheme, RainbowKitAuthenticationProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { YieldProvider } from '@yo-protocol/react';
import { ReactNode, useState } from 'react';
import { useSiweAdapter } from './useSiweAdapter';

const config = getDefaultConfig({
  appName: 'Oasis - Self-Driving Savings',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c2e8a1a364d9f688e16e6d7d6f510ccb',
  chains: [base],
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { adapter, status } = useSiweAdapter();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={adapter}
          status={status}
        >
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: '#E2725B', 
              accentColorForeground: '#FFF5EE', 
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            <YieldProvider partnerId={101} defaultSlippageBps={50}>
              {children}
            </YieldProvider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
