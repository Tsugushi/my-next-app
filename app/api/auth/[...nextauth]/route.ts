import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 🔐 環境変数からのみ取得（デフォルト値は使わない）
        const user = process.env.POC_USER;
        const pass = process.env.POC_PASS;

        // 設定漏れ時は必ず認証失敗（安全側）
        if (!user || !pass) {
          console.error("POC_USER / POC_PASS is not set");
          return null;
        }

        const username = credentials?.username ?? "";
        const password = credentials?.password ?? "";

        if (username === user && password === pass) {
          return {
            id: "poc-user",
            name: "PoC User",
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

