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

type PollOption = {
  id: string;
  option_text: string;
  votes?: number;
};

type Poll = {
  id: string;
  body: string;
  poll_options: PollOption[];
};

type Props = {
  polls: Poll[];
};

// Sleek modern colors for chart bars
const COLORS = ["#4f46e5", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];

const SAMPLE_POLLS: Poll[] = [
  {
    id: "sample-1",
    body: "Which state management tool do you prefer for React? #React #State",
    poll_options: [
      { id: "s1", option_text: "Zustand", votes: 25 },
      { id: "s2", option_text: "Redux Toolkit", votes: 12 },
      { id: "s3", option_text: "React Context", votes: 8 },
    ],
  },
  {
    id: "sample-2",
    body: "How do you write your CSS in modern projects? #CSS #Styling",
    poll_options: [
      { id: "s4", option_text: "Tailwind CSS", votes: 34 },
      { id: "s5", option_text: "CSS Modules", votes: 15 },
      { id: "s6", option_text: "Vanilla CSS", votes: 5 },
    ],
  },
];

export default function PollAnalytics({ polls }: Props) {
  const displayPolls = (!polls || polls.length === 0) ? SAMPLE_POLLS : polls;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🗳️</span> Poll Vote Distributions
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "20px",
      }}>
        {displayPolls.map((poll) => {
          const totalVotes = poll.poll_options.reduce(
            (sum, opt) => sum + (opt.votes ?? 0),
            0
          );

          const data = poll.poll_options.map((opt) => ({
            name:
              opt.option_text.length > 22
                ? opt.option_text.slice(0, 22) + "..."
                : opt.option_text,
            votes: opt.votes ?? 0,
            displayVotes: (opt.votes && opt.votes > 0) ? opt.votes : 1,
          }));

          return (
            <div
              key={poll.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "300px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 4px" }}>
                  {poll.body}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 16px" }}>
                  Total Votes: <strong style={{ color: "var(--accent)" }}>{totalVotes}</strong>
                </p>
              </div>

              <div style={{ width: "100%", height: 200, flex: 1, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="var(--muted)" fontSize={10} tickLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--muted)"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div style={{
                              background: "var(--foreground)",
                              color: "#ffffff",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                            }}>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <div style={{ color: "var(--accent-light)" }}>Votes: {item.votes}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="displayVotes" radius={[0, 4, 4, 0]}>
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
