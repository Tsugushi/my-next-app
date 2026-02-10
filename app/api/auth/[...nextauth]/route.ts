import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Auth.js / NextAuth の両系統に対応する secret の解決
 * - AUTH_SECRET（Auth.js / v5 系）
 * - NEXTAUTH_SECRET（NextAuth v4 系）
 */
const authSecret =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!authSecret) {
  // Vercel Runtime Logs に必ず出る
  console.error("❌ AUTH_SECRET / NEXTAUTH_SECRET is missing");
}

const handler = NextAuth({
  secret: authSecret,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = process.env.POC_USER;
        const pass = process.env.POC_PASS;

        // 環境変数が無ければ必ず失敗（安全側）
        if (!user || !pass) {
          console.error("❌ POC_USER / POC_PASS is not set");
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
});

export { handler as GET, handler as POST };
