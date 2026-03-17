"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';

export function useSiweAdapter() {
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/siwe/me', { cache: 'no-store' });
      const data = await res.json();
      setStatus(data.address ? 'authenticated' : 'unauthenticated');
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const response = await fetch('/api/siwe/nonce', { cache: 'no-store' });
          const data = await response.json();
          return data.nonce;
        },
        createMessage: ({ nonce, address, chainId }) => {
          return new SiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in to Oasis with your wallet.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          }).prepareMessage(); 
        },
        verify: async ({ message, signature }) => {
          const verifyRes = await fetch('/api/siwe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, signature }),
          });

          if (verifyRes.ok) {
            await checkSession();
            return true;
          }
          setStatus('unauthenticated');
          return false;
        },
        signOut: async () => {
          await fetch('/api/siwe/logout', { cache: 'no-store' });
          await checkSession();
        },
      }),
    [checkSession]
  );

  return { adapter, status };
}
