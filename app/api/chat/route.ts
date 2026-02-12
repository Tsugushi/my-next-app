import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { messages?: Msg[] };
    const messages = body.messages ?? [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.text?.trim();

    if (!lastUser) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: lastUser,
      max_output_tokens: 300,
      reasoning: { effort: "minimal" },
    });

    const text = response.output_text || "";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

