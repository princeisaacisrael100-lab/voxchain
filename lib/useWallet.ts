import { useState, useCallback, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { SEPOLIA_CHAIN_ID } from "@/lib/contract";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (silent = false) => {
    if (typeof window === "undefined" || !window.ethereum) {
      if (!silent) setError("MetaMask not found.");
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ 
        method: silent ? "eth_accounts" : "eth_requestAccounts" 
      }) as string[];
      
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
        if (chainId !== SEPOLIA_CHAIN_ID && !silent) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: SEPOLIA_CHAIN_ID }],
            });
          } catch {
            setError("Please switch to Sepolia in MetaMask.");
            setLoading(false);
            return;
          }
        } else if (chainId !== SEPOLIA_CHAIN_ID && silent) {
          // If silent and wrong chain, we don't auto-connect to avoid annoying the user
          return;
        }
        setAddress(accounts[0]);
      }
    } catch (e) {
      if (!silent) setError("Connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect(true);
  }, [connect]);

  // Listen for changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    
    const handleAccounts = (accounts: string[]) => {
      setAddress(accounts.length > 0 ? accounts[0] : null);
    };
    const handleChain = () => window.location.reload();

    (window.ethereum as any).on("accountsChanged", handleAccounts);
    (window.ethereum as any).on("chainChanged", handleChain);

    return () => {
      (window.ethereum as any).removeListener("accountsChanged", handleAccounts);
      (window.ethereum as any).removeListener("chainChanged", handleChain);
    };
  }, []);

  const getProvider = useCallback(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    return new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
  }, []);

  const getSigner = useCallback(() => getProvider()?.getSigner() ?? null, [getProvider]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const short = useMemo(() => address ? address.slice(0, 6) + "..." + address.slice(-4) : null, [address]);

  return useMemo(() => ({
    address,
    short,
    loading,
    error,
    connect,
    disconnect,
    getProvider,
    getSigner
  }), [address, short, loading, error, connect, disconnect, getProvider, getSigner]);
}
