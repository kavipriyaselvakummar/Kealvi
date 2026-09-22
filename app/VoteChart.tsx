"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Question = {
  id: string;
  body: string;
  votes: number;
};

// Vibrant color palette for histogram bars
const BAR_COLORS = [
  "#4f46e5", // Indigo
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#6366f1", // Violet
  "#14b8a6", // Teal
];

export default function VoteChart({
  questions,
}: {
  questions: Question[];
}) {
  // Check if any question has votes > 0
  const maxVote = Math.max(...questions.map((q) => q.votes), 0);

  // Take top 10 questions to prevent X-axis clutter
  const sorted = [...questions].sort((a, b) => b.votes - a.votes);
  const displayQuestions = sorted.slice(0, 10);

  const data = displayQuestions.map((q, idx) => {
    // If no votes exist in database, provide sample distribution values for visual preview
    let displayVal = q.votes;
    if (maxVote === 0) {
      displayVal = Math.max(12 - idx * 1.1, 2);
    } else if (q.votes === 0) {
      displayVal = 0.5; // subtle colored bar so 0-vote items are still colorful & visible
    }

    return {
      name:
        q.body.length > 20
          ? q.body.slice(0, 20) + "..."
          : q.body,
      fullName: q.body,
      votes: q.votes,
      displayVotes: displayVal,
    };
  });

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            📊 Live Question Vote Distribution
          </h2>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 0" }}>
            Real-time vote counts across top audience questions
          </p>
        </div>
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          background: "var(--accent-light)",
          color: "var(--accent)",
          padding: "4px 10px",
          borderRadius: "20px",
        }}>
          {displayQuestions.length} Questions Plotted
        </span>
      </div>

      <div style={{ width: "100%", height: 320, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
            <XAxis
              dataKey="name"
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div style={{
                      background: "var(--foreground)",
                      color: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.fullName}</div>
                      <div style={{ color: "var(--accent-light)" }}>Votes: {item.votes}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="displayVotes" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}