import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: Request) {
  // ① 認証（防御的にAPI側でもチェック）
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ② 入力
  const body = (await req.json()) as { messages?: Msg[] };
  const messages = body.messages ?? [];

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.text?.trim();
  if (!lastUser) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  // ③ OpenAI 呼び出し（Responses API）
  // ※ 公式では Responses API を推奨・移行ガイドあり :contentReference[oaicite:2]{index=2}
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: "gpt-5-mini",
    instructions: "You are a helpful assistant.",
    input: lastUser,
    max_output_tokens: 300,
    reasoning: { effort: "minimal" }, // ← reasoningを最小化：追加
  });


  console.log("===== OpenAI RAW RESPONSE =====");
  console.log(JSON.stringify(response, null, 2));
  console.log("================================");


  let text = "";

if (response.output_text) {
  text = response.output_text;
} else if (response.output) {
  for (const item of response.output) {
    if (item.content) {
      for (const c of item.content) {
        if (c.type === "output_text" && c.text) {
          text += c.text;
        }
      }
    }
  }
}

return NextResponse.json({ text });

  

}
