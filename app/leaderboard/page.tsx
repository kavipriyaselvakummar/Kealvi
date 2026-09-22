import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const MEDAL: Record<number, string> = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

export default async function LeaderboardPage() {
  const data = await getQuestionsPage(0, 100);
  const sorted = [...data.questions].sort((a, b) => b.votes - a.votes);
  const maxVotes = sorted[0]?.votes || 1;

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="editorial-header">
        <h1>🏆 Leaderboard</h1>
        <span className="editorial-dateline">
          Top {sorted.length} questions by vote count
        </span>
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "0.5px solid var(--border)",
            borderRadius: "6px",
            background: "var(--surface)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏁</div>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            No questions yet. Be the first to ask one!
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 80px",
              gap: "12px",
              padding: "10px 20px",
              background: "var(--surface2)",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Rank</span>
            <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Question</span>
            <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, textAlign: "right" }}>Votes</span>
          </div>

          {sorted.map((q, index) => {
            const barWidth = maxVotes > 0 ? (q.votes / maxVotes) * 100 : 0;
            const isTop3 = index < 3;

            return (
              <div
                key={q.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 80px",
                  gap: "12px",
                  padding: "14px 20px",
                  borderBottom: "0.5px solid var(--border)",
                  background: isTop3
                    ? index === 0
                      ? "rgba(91,61,232,0.04)"
                      : "transparent"
                    : "transparent",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
              >
                {/* Rank */}
                <div style={{ textAlign: "center" }}>
                  {MEDAL[index] ? (
                    <span style={{ fontSize: "20px" }}>{MEDAL[index]}</span>
                  ) : (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--border)",
                      }}
                    >
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Question body */}
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: isTop3 ? 500 : 400,
                      color: "var(--foreground)",
                      margin: "0 0 8px 0",
                      lineHeight: 1.45,
                    }}
                  >
                    {q.body}
                    {q.is_featured && (
                      <span
                        style={{
                          marginLeft: "8px",
                          background: "#fef3c7",
                          color: "#92400e",
                          fontSize: "9px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: "10px",
                          verticalAlign: "middle",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        📌 Featured
                      </span>
                    )}
                  </p>
                  {/* Vote bar */}
                  <div
                    style={{
                      height: "3px",
                      background: "var(--surface2)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        background:
                          index === 0
                            ? "var(--accent)"
                            : index === 1
                            ? "var(--accent-mid)"
                            : index === 2
                            ? "#9a85f2"
                            : "var(--border)",
                        borderRadius: "2px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  {q.author && (
                    <p
                      style={{
                        marginTop: "5px",
                        fontSize: "11px",
                        color: "var(--muted)",
                      }}
                    >
                      by {q.author}
                    </p>
                  )}
                </div>

                {/* Vote count */}
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 500,
                      color: isTop3 ? "var(--accent)" : "var(--foreground)",
                      lineHeight: 1,
                      display: "block",
                    }}
                  >
                    {q.votes}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {q.votes === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {sorted.length > 0 && (
        <p
          style={{
            marginTop: "16px",
            fontSize: "11px",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          Showing top {sorted.length} questions • Ranked by community votes
        </p>
      )}
    </main>
  );
}