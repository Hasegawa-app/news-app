import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GNEWS_API_KEY が設定されてない" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || "general";
    const keyword = searchParams.get("q") || "";
    const rawLang = searchParams.get("lang") || "ja";
    const lang = rawLang === "en" ? "en" : "ja";
    const max = searchParams.get("max") || "5";

    let url = "";

    if (keyword.trim()) {
      if (lang === "ja") {
        url =
          `https://gnews.io/api/v4/search?` +
          `q=${encodeURIComponent(keyword)}` +
          `&lang=ja&country=jp&max=${max}&token=${apiKey}`;
      } else {
        url =
          `https://gnews.io/api/v4/search?` +
          `q=${encodeURIComponent(keyword)}` +
          `&lang=en&max=${max}&token=${apiKey}`;
      }
    } else {
      if (lang === "ja") {
        url =
          `https://gnews.io/api/v4/top-headlines?` +
          `category=${encodeURIComponent(category)}` +
          `&lang=ja&country=jp&max=${max}&token=${apiKey}`;
      } else {
        url =
          `https://gnews.io/api/v4/top-headlines?` +
          `category=${encodeURIComponent(category)}` +
          `&lang=en&max=${max}&token=${apiKey}`;
      }
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.errors?.[0] || "ニュース取得失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("news api error:", error);
    return NextResponse.json(
      { error: "ニュース取得中にエラーが起きた" },
      { status: 500 }
    );
  }
}