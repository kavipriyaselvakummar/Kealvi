"use client";

import { useState, useEffect } from "react";

export default function AiInsights() {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights");
      if (!res.ok) throw new Error("Failed to load insights");
      const data = await res.json();
      setInsights(data.insights || "");
      setIsLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Load automatically on first mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInsights();
  }, []);

  function parseMarkdown(text: string) {
    if (!text) return null;
    const sections = text.split(/###\s+/);
    
    return sections
      .map((section) => section.trim())
      .filter((section) => section.length > 0)
      .map((section, idx) => {
        const lines = section.split("\n");
        const heading = lines[0].trim();
        const contentLines = lines.slice(1).filter((l) => l.trim().length > 0);

        return (
          <div
            key={idx}
            style={{
              borderTop: "2px solid var(--border)",
              paddingTop: "14px",
              marginTop: "18px",
            }}
          >
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
                margin: "0 0 10px 0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {heading}
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {contentLines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[-*\d.]+\s+/, "").trim();
                return (
                  <li
                    key={lIdx}
                    style={{
                      fontSize: "12.5px",
                      color: "var(--muted)",
                      lineHeight: "1.6",
                      paddingLeft: "14px",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "8px",
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                      }}
                    />
                    {cleanLine}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      });
  }

  return (
    <div
      className="aside-card"
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: "6px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "0.5px solid var(--border)",
          paddingBottom: "12px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧠</span>
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              AI Analyst Insights
            </h3>
            <p style={{ fontSize: "10px", color: "var(--muted)", margin: 0 }}>
              Live Q&A and Poll Analysis
            </p>
          </div>
        </div>
        <span
          style={{
            background: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "9px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Active
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2.5px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            Analyzing audience data...
          </span>
        </div>
      ) : isLoaded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ marginBottom: "12px" }}>
            {parseMarkdown(insights)}
          </div>
          <button
            onClick={fetchInsights}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "8px 16px",
              fontSize: "12px",
              borderRadius: "4px",
              cursor: "pointer",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <span>🔄</span> Refresh Analysis
          </button>
        </div>
      ) : (
        <button
          onClick={fetchInsights}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "12px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Generate Insights
        </button>
      )}
    </div>
  );
}
