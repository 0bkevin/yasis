"use client";

import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { YieldProvider } from '@yo-protocol/react';
import { ToastProvider } from '@/components/ui/Toast';
import { ReactNode, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { siweConfig } from './siweConfig';

import { AppKitNetwork } from '@reown/appkit/networks';

const projectId = 'e355085c48c97d70659555a2a21f9ce9'
const networks = [base] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  siweConfig,
  metadata: {
    name: 'Oasis - Self-Driving Savings',
    description: 'Self-driving savings with Oasis',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://oasis.xyz',
    icons: ['https://oasis.xyz/icon.png']
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#E2725B',
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  allWallets: "SHOW",
});

export function Providers({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <YieldProvider partnerId={101} defaultSlippageBps={50}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </YieldProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
