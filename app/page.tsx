"use client";

import { useMemo, useState } from "react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "こんにちは！PoC用のチャット画面です。質問を入力して送信してください（いまはダミー応答です）。",
      ts: Date.now(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  async function onSend() {
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInput("");

    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // ダミー応答（後でChatGPT APIに置き換える）
    await new Promise((r) => setTimeout(r, 600));
    const assistantMsg: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: `（ダミー）「${text}」を受け取りました。次はAPI接続で本物の回答にします。`,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsSending(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enterで送信、Shift+Enterで改行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={{ fontWeight: 700 }}>GenAI PoC Chat (UI Only)</div>
        <div style={{ color: "#666", fontSize: 12 }}>Next.js / Vercel デモ用（ダミー応答）</div>
      </header>

      <section style={styles.chat}>
        {messages.map((m) => (
          <div key={m.id} style={{ ...styles.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ ...styles.bubble, ...(m.role === "user" ? styles.userBubble : styles.assistantBubble) }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div style={styles.meta}>{new Date(m.ts).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isSending && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, ...styles.assistantBubble, opacity: 0.8 }}>送信中…</div>
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="質問を入力（Enterで送信 / Shift+Enterで改行）"
          style={styles.textarea}
          rows={3}
        />
        <button onClick={onSend} disabled={!canSend} style={{ ...styles.button, opacity: canSend ? 1 : 0.5 }}>
          送信
        </button>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f6f7f9",
    color: "#111",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  header: {
    padding: "16px 16px 8px",
    maxWidth: 920,
    width: "100%",
    margin: "0 auto",
  },
  chat: {
    flex: 1,
    maxWidth: 920,
    width: "100%",
    margin: "0 auto",
    padding: "8px 16px 16px",
    overflowY: "auto",
  },
  row: { display: "flex", marginBottom: 10 },
  bubble: {
    maxWidth: "78%",
    borderRadius: 14,
    padding: "10px 12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  userBubble: { background: "#111", color: "#fff" },
  assistantBubble: { background: "#fff", color: "#111", border: "1px solid #e7e7e7" },
  meta: { fontSize: 11, opacity: 0.65, marginTop: 6 },
  footer: {
    maxWidth: 920,
    width: "100%",
    margin: "0 auto",
    padding: "12px 16px 18px",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 10,
    outline: "none",
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    border: "none",
    padding: "10px 14px",
    background: "#2b6cff",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
