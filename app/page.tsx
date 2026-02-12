"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
};

export default function Page() {
  const router = useRouter();
  const { status } = useSession();

  // ✅ Hydrationズレ回避：初期メッセージは固定値
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "こんにちは！PoC用のチャット画面です。質問を入力して送信してください。",
      ts: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ stale回避：最新messagesを参照する
  const messagesRef = useRef<Msg[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ✅ 未認証なら /signin へ
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  // Hookはここまでで固定。ここから下で条件returnしてOK。
  if (status === "loading") {
    return <main style={{ padding: 20 }}>Loading...</main>;
  }

  if (status === "unauthenticated") {
    // リダイレクト実行中は表示しない
    return null;
  }

  const canSend = input.trim().length > 0 && !isSending;

  async function onSend() {
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInput("");

    const now = Date.now();
    const userMsg: Msg = {
      id: `u-${now}-${Math.random()}`,
      role: "user",
      text,
      ts: now,
    };

    // 先に画面へ反映
    setMessages((prev) => [...prev, userMsg]);

    try {
      // 送信する履歴（最新 + 今回のユーザー発言）
      const payloadMessages = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const errText = await res.text();
        const t = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${t}-${Math.random()}`,
            role: "assistant",
            text: `（エラー）API呼び出しに失敗しました: ${res.status}\n${errText}`,
            ts: t,
          },
        ]);
        return;
      }

      const data = (await res.json()) as { text?: string };
      const t = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${t}-${Math.random()}`,
          role: "assistant",
          text: (data.text ?? "").trim() || "（空の応答でした）",
          ts: t,
        },
      ]);
    } catch (e: any) {
      const t = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${t}-${Math.random()}`,
          role: "assistant",
          text: `（例外）通信に失敗しました: ${e?.message ?? String(e)}`,
          ts: t,
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
        <div style={{ fontWeight: 700 }}>GenAI PoC Chat</div>
        <div style={{ color: "#666", fontSize: 12 }}>
          Next.js / NextAuth / Vercel（ChatGPT API接続）
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            style={{ ...styles.smallButton }}
          >
            Sign out
          </button>
        </div>
      </header>

      <section style={styles.chat}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.row,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.assistantBubble),
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div style={styles.meta}>
                {m.ts ? new Date(m.ts).toLocaleTimeString() : ""}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div
              style={{
                ...styles.bubble,
                ...styles.assistantBubble,
                opacity: 0.85,
              }}
            >
              送信中…
            </div>
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
        <button
          onClick={onSend}
          disabled={!canSend}
          style={{ ...styles.button, opacity: canSend ? 1 : 0.5 }}
        >
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
  smallButton: {
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: "8px 10px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};
