import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, description, lang } = await req.json();

    if (!title && !description) {
      return NextResponse.json(
        { error: "解説するニュースがない" },
        { status: 400 }
      );
    }

    const prompt = `
以下のニュースをわかりやすく解説してください。

条件:
- 3〜5文
- 初学者でも理解できるように
- 背景も少し補足する
- 専門用語はやさしく言い換える
- 箇条書きではなく自然な文章にする

ニュースの言語:
${lang === "en" ? "英語ニュース" : "日本語ニュース"}

タイトル:
${title || ""}

概要:
${description || ""}
`;

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    return NextResponse.json({
      explanation: response.output_text?.trim() || "",
    });
  } catch (error) {
    console.error("news explain error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "解説生成失敗" },
      { status: 500 }
    );
  }
}