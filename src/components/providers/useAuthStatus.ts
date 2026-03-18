"use client";
import { useAccount } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAuthenticationStatus(): 'loading' | 'unauthenticated' | 'authenticated' {
  const { address, status: wagmiStatus } = useAccount();
  const queryClient = useQueryClient();

  const { data: sessionAddress, isLoading } = useQuery({
    queryKey: ['siwe-me', address],
    queryFn: async () => {
      const res = await fetch('/api/siwe/me', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.address as string | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    const handleStatusChange = () => {
      queryClient.invalidateQueries({ queryKey: ['siwe-me'] });
    };
    window.addEventListener('siwe-status-change', handleStatusChange);
    return () => window.removeEventListener('siwe-status-change', handleStatusChange);
  }, [queryClient]);

  if (wagmiStatus === 'connecting' || wagmiStatus === 'reconnecting' || isLoading) {
    return 'loading';
  }

  if (!address || !sessionAddress || sessionAddress.toLowerCase() !== address.toLowerCase()) {
    return 'unauthenticated';
  }

  return 'authenticated';
}
