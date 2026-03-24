"use client";
import { useState } from "react";
import styles from "./CreatePoll.module.css";

interface Props {
  connected: boolean;
  onSubmit: (question: string, options: string[]) => Promise<void>;
}

export default function CreatePoll({ connected, onSubmit }: Props) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const update = (i: number, v: string) => {
    const n = [...options]; n[i] = v; setOptions(n);
  };
  const add = () => { if (options.length < 6) setOptions([...options, ""]); };
  const remove = (i: number) => { if (options.length > 2) setOptions(options.filter((_, x) => x !== i)); };

  const submit = async () => {
    const filtered = options.filter((o) => o.trim());
    if (!question.trim() || filtered.length < 2) return;
    setLoading(true);
    try { await onSubmit(question.trim(), filtered); setQuestion(""); setOptions(["", ""]); }
    finally { setLoading(false); }
  };

  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>New Poll</div>

      <div className={styles.field}>
        <label className={styles.label}>Question</label>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="What does the community decide?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Choices</label>
        {options.map((opt, i) => (
          <div key={i} className={styles.optRow}>
            <span className={styles.optLetter}>{letters[i]}</span>
            <input
              className={styles.input}
              type="text"
              placeholder={`Choice ${letters[i]}`}
              value={opt}
              onChange={(e) => update(i, e.target.value)}
            />
            {options.length > 2 && (
              <button className={styles.removeBtn} onClick={() => remove(i)}>−</button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button className={styles.addBtn} onClick={add}>+ Add choice</button>
        )}
      </div>

      <button
        className={styles.submitBtn}
        onClick={submit}
        disabled={!connected || loading}
      >
        {loading ? "Publishing..." : connected ? "Publish Poll →" : "Connect wallet to publish"}
      </button>

      {connected && (
        <p className={styles.hint}>Gas fee required · Sepolia testnet</p>
      )}
    </div>
  );
}
