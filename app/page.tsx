"use client";

import { useState } from "react";

type NewsItem = {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
};

export default function Page() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [newsCategory, setNewsCategory] = useState("general");
  const [newsKeyword, setNewsKeyword] = useState("");
  const [newsLang, setNewsLang] = useState("ja");

  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsError("");
    setNews([]);
    setExplanations({});
    setLoadingIndex(null);

    try {
      let url = "";

      if (newsKeyword.trim()) {
        url = `/api/news?q=${encodeURIComponent(
          newsKeyword.trim()
        )}&lang=${encodeURIComponent(newsLang)}`;
      } else {
        url = `/api/news?category=${encodeURIComponent(
          newsCategory
        )}&lang=${encodeURIComponent(newsLang)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ニュース取得失敗");
      }

      setNews(data.articles || []);
    } catch (err) {
      if (err instanceof Error) {
        setNewsError(err.message);
      } else {
        setNewsError("ニュース取得失敗");
      }
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchExplanation = async (
    index: number,
    title: string,
    description: string
  ) => {
    setLoadingIndex(index);

    try {
      const res = await fetch("/api/news-explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          lang: newsLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "解説取得失敗");
      }

      setExplanations((prev) => ({
        ...prev,
        [index]: data.explanation || "",
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "解説取得失敗");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerBox}>
          <h1 style={styles.title}>ニュース取得アプリ</h1>
          <p style={styles.subtitle}>
            カテゴリまたはキーワードでニュースを取得して、AIで解説する
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.controls}>
            <div style={styles.field}>
              <label style={styles.label}>カテゴリで拾う</label>
              <select
                style={styles.input}
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value)}
              >
                <option value="general">general</option>
                <option value="world">world</option>
                <option value="nation">nation</option>
                <option value="business">business</option>
                <option value="technology">technology</option>
                <option value="entertainment">entertainment</option>
                <option value="sports">sports</option>
                <option value="science">science</option>
                <option value="health">health</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>キーワード検索</label>
              <input
                style={styles.input}
                value={newsKeyword}
                onChange={(e) => setNewsKeyword(e.target.value)}
                placeholder={
                  newsLang === "ja"
                    ? "例：教育 / 台湾 / TOEIC"
                    : "Example: education / Taiwan / TOEIC"
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>言語</label>
            <select
  style={styles.input}
  value={newsLang}
  onChange={(e) => {
    const nextLang = e.target.value;
    setNewsLang(nextLang);
    setNewsKeyword("");
    setNews([]);
    setNewsError("");
  }}
>
  <option value="ja">日本語</option>
  <option value="en">英語</option>
</select>
            </div>
          </div>

          <p style={styles.helpText}>
            キーワードを入れたらそっちが優先。空ならカテゴリで取得する。
            英語ニュースを探すときは、キーワードも英語のほうが拾いやすい。
          </p>

          <button style={styles.button} onClick={fetchNews} disabled={newsLoading}>
            {newsLoading ? "取得中..." : "ニュースを取得"}
          </button>

          {newsError && <div style={styles.errorBox}>{newsError}</div>}

          {news.length > 0 && (
            <div style={styles.newsList}>
              {news.map((item, index) => (
                <div key={index} style={styles.newsCard}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={styles.newsImage}
                    />
                  )}

                  <div style={styles.newsBody}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.newsTitle}
                    >
                      {item.title}
                    </a>

                    {item.source?.name && (
                      <p style={styles.newsMeta}>{item.source.name}</p>
                    )}

                    {item.publishedAt && (
                      <p style={styles.newsMeta}>
                        {new Date(item.publishedAt).toLocaleString("ja-JP")}
                      </p>
                    )}

                    <p style={styles.newsDescription}>
                      {item.description || "説明なし"}
                    </p>

                    <button
                      style={{
                        ...styles.explainButton,
                        ...(loadingIndex === index
                          ? styles.explainButtonDisabled
                          : {}),
                      }}
                      onClick={() =>
                        fetchExplanation(
                          index,
                          item.title,
                          item.description || ""
                        )
                      }
                      disabled={loadingIndex === index}
                    >
                      {loadingIndex === index ? "解説中..." : "AI解説"}
                    </button>

                    {explanations[index] && (
                      <div style={styles.explainBox}>
                        <p style={styles.explainTitle}>AI解説</p>
                        <p style={styles.explainText}>
                          {explanations[index]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, rgb(244, 247, 255) 0%, rgb(250, 251, 255) 100%)",
    padding: "32px 16px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  headerBox: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
    color: "#1f2a44",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#5f6b85",
    fontSize: "15px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
    border: "1px solid #e7ebf3",
    marginBottom: "20px",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#33415c",
  },
  input: {
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #cfd7e6",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#fbfcff",
    boxSizing: "border-box",
  },
  helpText: {
    marginTop: "12px",
    marginBottom: 0,
    color: "#5f6b85",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  button: {
    marginTop: "20px",
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: "16px",
    backgroundColor: "#fff1f2",
    color: "#b42318",
    border: "1px solid #fecdd3",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
  },
  newsList: {
    display: "grid",
    gap: "16px",
    marginTop: "20px",
  },
  newsCard: {
    backgroundColor: "#f8fbff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  newsImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    display: "block",
  },
  newsBody: {
    padding: "16px",
  },
  newsTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1d4ed8",
    textDecoration: "none",
    display: "block",
    marginBottom: "8px",
    lineHeight: 1.5,
  },
  newsMeta: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    color: "#64748b",
  },
  newsDescription: {
    margin: "8px 0 0 0",
    fontSize: "15px",
    color: "#334155",
    lineHeight: 1.7,
  },
  explainButton: {
    marginTop: "12px",
    height: "38px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  explainButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  explainBox: {
    marginTop: "12px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #6ee7b7",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  explainTitle: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    fontWeight: 800,
    color: "#047857",
  },
  explainText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#065f46",
    whiteSpace: "pre-wrap",
  },
};