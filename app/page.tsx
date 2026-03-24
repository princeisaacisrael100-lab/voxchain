"use client";
import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@/lib/useWallet";
import { usePolls } from "@/lib/usePolls";
import { Poll, CONTRACT_ADDRESS } from "@/lib/contract";
import Header from "@/components/Header";
import PollCard from "@/components/PollCard";
import VoteModal from "@/components/VoteModal";
import CreatePoll from "@/components/CreatePoll";
import Toast from "@/components/Toast";
import styles from "./page.module.css";

export default function Home() {
  const wallet = useWallet();
  const { polls, loading, error, loadPolls, createPoll, castVote, closePoll, deletePoll } = usePolls();

  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [blockNum, setBlockNum] = useState<string>("—");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const showToast = (msg: string, isError = false) => setToast({ msg, error: isError });
  const clearToast = useCallback(() => setToast(null), []);

  const { getProvider, address } = wallet;

  const refresh = useCallback(async (addr: string | null) => {
    const p = getProvider();
    if (p) {
      await loadPolls(p, addr);
      try {
        const hex = await (window as any).ethereum.request({ method: "eth_blockNumber" });
        setBlockNum("#" + parseInt(hex, 16).toLocaleString());
      } catch {}
    }
  }, [getProvider, loadPolls]);

  useEffect(() => {
    if (address) refresh(address);
  }, [address, refresh]);

  const handleConnect = async () => {
    await wallet.connect();
  };

  const handleVote = (pollId: number) => {
    if (!wallet.address) { showToast("Connect your wallet first.", true); return; }
    const poll = polls.find((p) => p.id === pollId);
    if (poll) setActivePoll(poll);
  };

  const handleSubmitVote = async (optionIndex: number): Promise<string> => {
    const signer = wallet.getSigner();
    if (!signer || !activePoll) throw new Error("No signer available");
    const hash = await castVote(signer, activePoll.id, optionIndex);
    showToast("Vote recorded on the blockchain!");
    await refresh(wallet.address);
    return hash;
  };

  const handleCreate = async (question: string, options: string[]) => {
    const signer = wallet.getSigner();
    if (!signer) { showToast("Connect your wallet first.", true); return; }
    try {
      showToast("Publishing poll — awaiting confirmation...");
      await createPoll(signer, question, options);
      showToast("Poll published on-chain!");
      await refresh(wallet.address);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message.slice(0, 80) : "Transaction failed", true);
    }
  };

  const handleClose = async (pollId: number) => {
    const signer = wallet.getSigner();
    if (!signer) { showToast("Connect your wallet first.", true); return; }
    try {
      showToast("Closing poll...");
      await closePoll(signer, pollId);
      showToast("Poll closed successfully.");
      await refresh(wallet.address);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message.slice(0, 80) : "Failed to close poll", true);
    }
  };

  const handleDelete = async (pollId: number) => {
    if (!confirm("Permanently delete this poll? This cannot be undone.")) return;
    const signer = wallet.getSigner();
    if (!signer) { showToast("Connect your wallet first.", true); return; }
    try {
      showToast("Deleting poll...");
      await deletePoll(signer, pollId);
      showToast("Poll deleted.");
      await refresh(wallet.address);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message.slice(0, 80) : "Failed to delete poll", true);
    }
  };

  const filtered = polls.filter((p) => {
    if (filter === "open") return p.active;
    if (filter === "closed") return !p.active;
    return true;
  });

  const totalVotes = polls.reduce((s, p) => s + p.votes.reduce((a, b) => a + b, 0), 0);
  const myVoteCount = polls.filter((p) => p.voted).length;

  return (
    <>
      <Header
        address={wallet.address}
        short={wallet.short}
        loading={wallet.loading}
        onConnect={handleConnect}
        onDisconnect={wallet.disconnect}
      />

      {/* Hero banner */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Ethereum · Sepolia Testnet</p>
          <h1 className={styles.heroTitle}>Every voice.<br />Every vote.<br />On-chain.</h1>
          <p className={styles.heroSub}>
            VoxChain is a decentralized polling platform. Create a proposal,
            let the community vote, and trust the result — immutably recorded on Ethereum.
          </p>
          {!wallet.address && (
            <button className={styles.heroCta} onClick={handleConnect}>
              Connect wallet to participate →
            </button>
          )}
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{wallet.address ? polls.length : "—"}</span>
            <span className={styles.heroStatLabel}>Proposals</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{wallet.address ? totalVotes : "—"}</span>
            <span className={styles.heroStatLabel}>Total Votes</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{wallet.address ? myVoteCount : "—"}</span>
            <span className={styles.heroStatLabel}>My Votes</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{blockNum}</span>
            <span className={styles.heroStatLabel}>Block</span>
          </div>
        </div>
      </div>

      {/* Contract ribbon */}
      <div className={styles.ribbon}>
        <span className={styles.ribbonLabel}>Contract:</span>
        <a
          href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank" rel="noreferrer"
          className={styles.ribbonAddr}
        >
          {CONTRACT_ADDRESS}
        </a>
        <button
          className={styles.ribbonCopy}
          onClick={() => { navigator.clipboard.writeText(CONTRACT_ADDRESS); showToast("Address copied!"); }}
        >
          Copy
        </button>
      </div>

      {/* Main content */}
      <div className={styles.layout}>

        {/* Left: polls */}
        <section className={styles.pollsSection}>

          {/* Filter tabs */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Showing</span>
            {(["all", "open", "closed"] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.activeTab : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "open" ? "Open" : "Closed"}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className={styles.skeletons}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skel} style={{ width: "40%", height: "12px" }} />
                  <div className={styles.skel} style={{ width: "80%", height: "22px", marginTop: "12px" }} />
                  <div className={styles.skel} style={{ width: "100%", height: "5px", marginTop: "24px" }} />
                  <div className={styles.skel} style={{ width: "100%", height: "5px", marginTop: "10px" }} />
                  <div className={styles.skel} style={{ width: "60%", height: "5px", marginTop: "10px" }} />
                </div>
              ))}
            </div>
          ) : !wallet.address ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🗳</div>
              <p className={styles.emptyTitle}>Connect to see polls</p>
              <p className={styles.emptySub}>Connect your MetaMask wallet to load and participate in on-chain polls.</p>
              <button className={styles.emptyBtn} onClick={handleConnect}>Connect Wallet →</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{filter === "all" ? "📋" : "🔍"}</div>
              <p className={styles.emptyTitle}>
                {filter === "all" ? "No polls yet" : `No ${filter} polls`}
              </p>
              <p className={styles.emptySub}>
                {filter === "all"
                  ? "Be the first to publish a proposal."
                  : `There are no ${filter} polls at the moment.`}
              </p>
            </div>
          ) : (
            <div className={styles.pollsList}>
              {filtered.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  walletAddress={wallet.address}
                  onVote={handleVote}
                  onClose={handleClose}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              ⚠ {error}
            </div>
          )}
        </section>

        {/* Right: sidebar */}
        <aside className={styles.sidebar}>
          <CreatePoll connected={!!wallet.address} onSubmit={handleCreate} />

          {/* Info box */}
          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>How it works</div>
            <ol className={styles.infoList}>
              <li>Connect your MetaMask wallet on Sepolia</li>
              <li>Create a poll with up to 6 choices</li>
              <li>Share the link — anyone can vote once</li>
              <li>Results are permanent and tamper-proof</li>
              <li>Close or delete polls you created</li>
            </ol>
          </div>
        </aside>
      </div>

      {/* Vote modal */}
      {activePoll && (
        <VoteModal
          poll={activePoll}
          onClose={() => setActivePoll(null)}
          onSubmit={handleSubmitVote}
        />
      )}

      <Toast message={toast?.msg ?? null} error={toast?.error} onClear={clearToast} />
    </>
  );
}
