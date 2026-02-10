"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    if (res?.error) setError("ログインに失敗しました。ユーザー名/パスワードを確認してください。");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f7f9" }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          background: "#fff",
          border: "1px solid #e7e7e7",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18 }}>Sign in</h1>

        <label style={{ display: "block", marginTop: 12, fontSize: 13 }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        <label style={{ display: "block", marginTop: 12, fontSize: 13 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        {error && <div style={{ marginTop: 10, color: "#b00020", fontSize: 13 }}>{error}</div>}

        <button
          type="submit"
          style={{
            marginTop: 14,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            background: "#2b6cff",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
