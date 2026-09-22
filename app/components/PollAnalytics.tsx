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
const COLORS = ["#5b3de8", "#7c62ef", "#9a85f2", "#bfaeff"];

export default function PollAnalytics({ polls }: Props) {
  if (!polls || polls.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">
        No polls conducted yet to analyze.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🗳️</span> Poll Vote Distributions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => {
          const totalVotes = poll.poll_options.reduce(
            (sum, opt) => sum + (opt.votes ?? 0),
            0
          );

          const data = poll.poll_options.map((opt) => ({
            name:
              opt.option_text.length > 25
                ? opt.option_text.slice(0, 25) + "..."
                : opt.option_text,
            votes: opt.votes ?? 0,
          }));

          return (
            <div
              key={poll.id}
              className="rounded-xl border border-white/10 bg-[#2d2a24] p-5 shadow-lg flex flex-col justify-between"
              style={{ minHeight: "320px" }}
            >
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {poll.body}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Total Votes: {totalVotes}
                </p>
              </div>

              {totalVotes === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/5 p-4 text-xs text-gray-400">
                  No votes cast on this poll yet.
                </div>
              ) : (
                <div style={{ width: "100%", height: 200 }} className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18160f",
                          borderColor: "var(--border)",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                        labelStyle={{ color: "white", fontWeight: "bold" }}
                      />
                      <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
