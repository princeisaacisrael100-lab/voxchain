"use client";
import { useState } from "react";
import { Poll, CONTRACT_ADDRESS } from "@/lib/contract";
import styles from "./PollCard.module.css";

interface Props {
  poll: Poll;
  walletAddress: string | null;
  onVote: (pollId: number) => void;
  onClose: (pollId: number) => void;
  onDelete: (pollId: number) => void;
}

export default function PollCard({ poll, walletAddress, onVote, onClose, onDelete }: Props) {
  const [showActions, setShowActions] = useState(false);
  const total = poll.votes.reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...poll.votes, 0);
  const winnerIndex = total > 0 ? poll.votes.indexOf(maxVotes) : -1;

  return (
    <article className={`${styles.card} ${poll.closed ? styles.closed : ""}`}>
      {/* Header row */}
      <div className={styles.cardHeader}>
        <div className={styles.pollMeta}>
          <span className={styles.pollNum}>#{String(poll.id).padStart(3, "0")}</span>
          <span className={`${styles.statusPill} ${!poll.closed ? styles.active : styles.inactive}`}>
            {!poll.closed ? "Open" : "Closed"}
          </span>
        </div>
        {walletAddress && (
          <button className={styles.moreBtn} onClick={() => setShowActions(!showActions)}>
            ···
          </button>
        )}
      </div>

      {/* Actions dropdown */}
      {showActions && walletAddress && (
        <div className={styles.actionsMenu}>
          {!poll.closed && (
            <button className={styles.actionItem} onClick={() => { onClose(poll.id); setShowActions(false); }}>
              🔒 Close Poll
            </button>
          )}
          <button
            className={`${styles.actionItem} ${styles.danger}`}
            onClick={() => { onDelete(poll.id); setShowActions(false); }}
          >
            🗑 Delete Poll
          </button>
        </div>
      )}

      <h2 className={styles.question}>{poll.question}</h2>

      {/* Options */}
      <div className={styles.options}>
        {poll.options.map((opt, i) => {
          const pct = total ? Math.round((poll.votes[i] / total) * 100) : 0;
          const isWinner = i === winnerIndex && total > 0;
          return (
            <div key={i} className={`${styles.optRow} ${isWinner ? styles.winner : ""}`}>
              <div className={styles.optTop}>
                <span className={styles.optLabel}>
                  {isWinner && "🏆 "}{opt}
                </span>
                <span className={styles.optStat}>
                  {pct}% · {poll.votes[i]}
                </span>
              </div>
              <div className={styles.barBg}>
                <div
                  className={`${styles.barFill} ${isWinner ? styles.winnerBar : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.chip}>{total} vote{total !== 1 ? "s" : ""}</span>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ethLink}
          >
            ↗ Etherscan
          </a>
        </div>

        {poll.voted ? (
          <span className={styles.votedBadge}>✓ Voted</span>
        ) : !poll.closed ? (
          <button className={styles.voteBtn} onClick={() => onVote(poll.id)}>
            Cast Vote →
          </button>
        ) : (
          <span className={styles.closedNote}>Voting ended</span>
        )}
      </div>
    </article>
  );
}
