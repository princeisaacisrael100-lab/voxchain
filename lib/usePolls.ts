"use client";
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, Poll } from "@/lib/contract";

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(
    (sp: ethers.Signer | ethers.providers.Provider) =>
      new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sp),
    []
  );

  const loadPolls = useCallback(
    async (provider: ethers.providers.Web3Provider, walletAddress: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const contract = getContract(provider);
        const count = (await contract.totalPolls()).toNumber();
        if (count === 0) { setPolls([]); setLoading(false); return; }

        const loaded: Poll[] = [];
        for (let i = 0; i < count; i++) {
          try {
            const deleted = await contract.isDeleted(i);
            if (deleted) continue;
            const [question, options, votes, active] = await contract.getPoll(i);
            const voted = walletAddress ? await contract.didVote(i, walletAddress) : false;

            // Check if current user is creator
            let isCreator = false;
            if (walletAddress) {
              try {
                const pollData = await contract.polls(i);
                isCreator = pollData.creator.toLowerCase() === walletAddress.toLowerCase();
              } catch (e) {
                console.warn("Could not check creator for poll", i, e);
              }
            }

            loaded.push({
              id: i,
              question,
              options: [...options],
              votes: (votes as ethers.BigNumber[]).map((v) => v.toNumber()),
              active,
              voted,
              isCreator,
            });
          } catch { continue; }
        }
        setPolls(loaded);
      } catch (e: unknown) {
        setError((e instanceof Error ? e.message : String(e)).slice(0, 100));
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  const createPoll = useCallback(
    async (signer: ethers.Signer, question: string, options: string[]) => {
      const tx = await getContract(signer).createPoll(question, options);
      await tx.wait();
    },
    [getContract]
  );

  const castVote = useCallback(
    async (signer: ethers.Signer, pollId: number, optionIndex: number): Promise<string> => {
      const tx = await getContract(signer).vote(pollId, optionIndex);
      await tx.wait();
      return tx.hash;
    },
    [getContract]
  );

  const closePoll = useCallback(
    async (signer: ethers.Signer, pollId: number) => {
      const tx = await getContract(signer).closePoll(pollId);
      await tx.wait();
    },
    [getContract]
  );

  const deletePoll = useCallback(
    async (signer: ethers.Signer, pollId: number) => {
      const tx = await getContract(signer).deletePoll(pollId);
      await tx.wait();
    },
    [getContract]
  );

  return { polls, loading, error, loadPolls, createPoll, castVote, closePoll, deletePoll };
}
