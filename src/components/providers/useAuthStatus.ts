"use client";
import { useState, useEffect } from "react";

export function useAuthenticationStatus() {
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');

  useEffect(() => {
    fetch('/api/siwe/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.address) {
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  return status;
}
