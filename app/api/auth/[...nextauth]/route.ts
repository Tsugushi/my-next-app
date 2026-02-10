import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const secret = process.env.NEXTAUTH_SECRET;

if (!secret) {
  // Vercel Runtime Logs に確実に出る
  console.error("NEXTAUTH_SECRET is missing at runtime");
}

const handler = NextAuth({
  secret, // ← ここで必ず設定される
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

        if (!user || !pass) {
          console.error("POC_USER / POC_PASS is not set");
          return null;
        }

        const username = credentials?.username ?? "";
        const password = credentials?.password ?? "";

        if (username === user && password === pass) {
          return { id: "poc-user", name: "PoC User" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
});

export { handler as GET, handler as POST };
