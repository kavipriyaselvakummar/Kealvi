"use client";

import { useState } from "react";
import { getVoterId } from "@/lib/voter";
import { getCurrentUser } from "@/lib/auth";

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

export default function PollsList({
  initialPolls,
}: {
  initialPolls: Poll[];
  initialHasMore: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [polls, setPolls] = useState<Poll[]>(initialPolls);

  // New features: AI Suggestion & Hashtag Filtering states
  type GeneratedPoll = {
    question: string;
    options: string[];
  };

  const [aiSuggestions, setAiSuggestions] = useState<GeneratedPoll[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const res = await fetch("/api/ai/suggest?type=poll");
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function renderTextWithTags(text: string) {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTag(selectedTag === part ? null : part);
            }}
            className="cursor-pointer font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }

  async function createPoll() {
    const cleanOptions = options.filter((o) =>
      o.trim()
    );

    if (!question.trim()) {
      alert("Enter a question");
      return;
    }

    if (cleanOptions.length < 2) {
      alert(
        "At least 2 options are required"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/polls",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            body: question,
            options: cleanOptions,
            author: getCurrentUser()?.name || "Anonymous",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ??
            "Failed creating poll"
        );
        return;
      }

      setPolls([
        {
          ...data.poll,
          poll_options: cleanOptions.map((opt: string, i: number) => ({
            id: `opt-${Date.now()}-${i}`,
            option_text: opt,
            votes: 0,
          })),
        },
        ...polls,
      ]);
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error(error);
      alert(
        "Unexpected create poll error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function vote(
    pollId: string,
    optionId: string
  ) {
    try {
      const res = await fetch(
        `/api/polls/${pollId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            optionId,
            voterId: getVoterId(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ??
            "Vote failed"
        );
        return;
      }

      setPolls((prev) =>
        prev.map((p) =>
          p.id === pollId
            ? {
                ...p,
                poll_options: p.poll_options.map((o) =>
                  o.id === optionId
                    ? { ...o, votes: (o.votes ?? 0) + 1 }
                    : o
                ),
              }
            : p
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Unexpected vote error"
      );
    }
  }

  async function deletePoll(
    pollId: string
  ) {
    const confirmed = confirm(
      "Delete this poll?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/polls/${pollId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ??
            "Delete failed"
        );
        return;
      }

      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    } catch (error) {
      console.error(error);
      alert(
        "Unexpected delete error"
      );
    }
  }

  async function editPoll(
    pollId: string,
    currentBody: string
  ) {
    const updated = prompt(
      "Edit poll topic",
      currentBody
    );

    if (
      !updated ||
      !updated.trim()
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/polls/${pollId}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            body: updated,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ??
            "Update failed"
        );
        return;
      }

      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, body: updated } : p))
      );
    } catch (error) {
      console.error(error);
      alert(
        "Unexpected update error"
      );
    }
  }

  // Extract all hashtags from current visible polls
  const allTags = Array.from(
    new Set(
      polls.flatMap((p) => p.body.match(/#\w+/g) || [])
    )
  );

  const filteredPolls = selectedTag
    ? polls.filter((p) => p.body.includes(selectedTag))
    : polls;

  return (
    <div className="space-y-8">
      {/* CREATE POLL */}

      <div className="rounded-xl border bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Create Poll
        </h2>

        <input
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          placeholder="Question"
          className="kv-input mb-3"
        />

        {options.map(
          (option, index) => (
            <input
              key={index}
              value={option}
              onChange={(e) => {
                const next = [
                  ...options,
                ];

                next[index] =
                  e.target.value;

                setOptions(next);
              }}
              placeholder={`Option ${
                index + 1
              }`}
              className="kv-input mb-2"
            />
          )
        )}

        <div className="flex gap-2">
          <button
            onClick={() =>
              setOptions([
                ...options,
                "",
              ])
            }
            className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            + Option
          </button>

          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
            className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            {loadingSuggestions ? "✨ Loading..." : "✨ AI Suggest"}
          </button>

          <button
            onClick={createPoll}
            disabled={loading}
            className="btn-primary px-4 py-2"
          >
            {loading
              ? "Creating..."
              : "Create Poll"}
          </button>
        </div>

        {showSuggestions && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-md space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-gray-600 border-b border-gray-200 pb-2 mb-2">
              <span>✨ AI Suggested Polls</span>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                ✕ Close
              </button>
            </div>
            {loadingSuggestions ? (
              <div className="text-xs text-center py-2 text-gray-500 animate-pulse">
                Generating suggestions...
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-xs text-center py-2 text-gray-500">
                No suggestions generated.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {aiSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(s.question);
                      setOptions(s.options);
                      setShowSuggestions(false);
                    }}
                    className="text-left text-xs p-2.5 rounded border border-gray-200 hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition text-gray-900"
                  >
                    <div className="font-semibold text-gray-900">{s.question}</div>
                    <div className="text-gray-600 mt-1 flex gap-2 flex-wrap">
                      {s.options.map((opt, oIdx) => (
                        <span key={oIdx} className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hashtag Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-1 items-center">
          <span className="text-xs text-gray-400 font-medium">Trending Tags:</span>
          {allTags.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isActive ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  isActive
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs text-red-400 font-semibold hover:underline ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* POLLS */}

      {filteredPolls.map(
        (poll) => {
          const totalVotes =
            poll.poll_options.reduce(
              (sum, option) =>
                sum +
                (option.votes ?? 0),
              0
            );

          return (
            <div
              key={poll.id}
              className="rounded-xl border bg-white p-5 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {renderTextWithTags(poll.body)}
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      editPoll(
                        poll.id,
                        poll.body
                      )
                    }
                    className="rounded border border-blue-500 px-2 py-1 text-sm text-blue-400"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      deletePoll(
                        poll.id
                      )
                    }
                    className="rounded border border-red-500 px-2 py-1 text-sm text-red-400"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {poll.poll_options.map(
                  (option) => {
                    const votes =
                      option.votes ??
                      0;

                    const percent =
                      totalVotes > 0
                        ? (
                            (votes /
                              totalVotes) *
                            100
                          ).toFixed(
                            1
                          )
                        : "0";

                    return (
                      <button
                        key={
                          option.id
                        }
                        onClick={() =>
                          vote(
                            poll.id,
                            option.id
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:bg-gray-100 text-gray-800"
                      >
                        <div className="flex justify-between">
                          <span>
                            {
                              option.option_text
                            }
                          </span>

                          <span>
                            {votes} vote
                            {votes !== 1
                              ? "s"
                              : ""}
                            {" • "}
                            {percent}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </button>
                    );
                  }
                )}

                <p className="pt-2 text-xs text-gray-500">
                  Total votes:{" "}
                  {totalVotes}
                </p>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}