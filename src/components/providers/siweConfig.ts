"use client";

import { createSIWEConfig, formatMessage, SIWECreateMessageArgs, SIWEVerifyMessageArgs } from '@reown/appkit-siwe';

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : '',
    uri: typeof window !== 'undefined' ? window.location.origin : '',
    chains: [8453],
    statement: 'Sign in to Oasis with your wallet.',
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
  getNonce: async () => {
    const res = await fetch('/api/siwe/nonce', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch nonce');
    const data = await res.json();
    return data.nonce;
  },
  getSession: async () => {
    try {
      const res = await fetch('/api/siwe/me', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch session');
      const data = await res.json();
      if (data.address) {
        return { address: data.address, chainId: 8453 };
      }
      return null;
    } catch {
      return null;
    }
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const res = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });
      if (res.ok) {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('siwe-status-change'));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  signOut: async () => {
    try {
      await fetch('/api/siwe/logout', { cache: 'no-store' });
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('siwe-status-change'));
      return true;
    } catch {
      return false;
    }
  },
  onSignIn: () => {
    if (typeof window !== 'undefined') {
      // Broadcast the event just in case
      window.dispatchEvent(new Event('siwe-status-change'));
      
      // If we are on the landing page, direct them to the dashboard
      if (window.location.pathname === '/') {
        window.location.href = '/dashboard';
      }
    }
  },
  onSignOut: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('siwe-status-change'));
    }
  },
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
});