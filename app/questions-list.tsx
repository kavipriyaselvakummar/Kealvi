"use client";

import { useEffect, useState } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  is_featured?: boolean;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] =
    useState<Question[]>(initialQuestions);

  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] =
    useState(initialHasMore);
  const [sortBy, setSortBy] = useState<"recent" | "voted">("recent");

  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // New features: AI Suggestion & Hashtag Filtering states
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const res = await fetch("/api/ai/suggest?type=question");
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const url = query
          ? `/api/questions?q=${encodeURIComponent(
              query
            )}`
          : "/api/questions";

        const res = await fetch(url);

        if (!res.ok) return;

        const data = await res.json();

        setQuestions(data.questions ?? []);
        setHasMore(data.hasMore ?? false);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          body: draft,
        }),
      });

      if (!res.ok) {
        alert("Failed to create question");
        return;
      }

      const created = await res.json();

      setQuestions((qs) => [
        {
          ...created,
          votes: 0,
          is_featured: false,
        },
        ...qs,
      ]);

      setDraft("");
    } catch (err) {
      console.error(err);
    }
  }

  async function upvote(id: string) {
    try {
      const res = await fetch(
        `/api/questions/${id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            voterId: getVoterId(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Vote failed");
        return;
      }

      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id
            ? {
                ...q,
                votes: data.votes,
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFeatured(
  id: string,
  current: boolean
) {
  try {
    const res = await fetch(
      `/api/questions/${id}/feature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !current,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to update featured status");
      return;
    }

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? {
              ...q,
              is_featured: !current,
            }
          : q
      )
    );
  } catch (err) {
    console.error(err);
  }
}

  async function loadMore() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/questions?offset=${questions.length}`
      );

      const data = await res.json();

      setQuestions((qs) => [
        ...qs,
        ...(data.questions ?? []),
      ]);

      setHasMore(data.hasMore ?? false);
    } finally {
      setLoading(false);
    }
  }

  const totalVotes = questions.reduce(
    (sum, q) => sum + q.votes,
    0
  );

  const sortedAndFiltered = (() => {
    let result = [...questions];
    // Apply tag filter
    if (selectedTag) {
      result = result.filter((q) => q.body.includes(selectedTag));
    }
    // Apply sort
    result.sort((a, b) => {
      // Always pin featured to top
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      // Then sort by votes or keep original order
      if (sortBy === "voted") return b.votes - a.votes;
      return 0;
    });
    return result;
  })();

  const featuredCount =
    questions.filter(
      (q) => q.is_featured
    ).length;

  // Extract all hashtags from current visible questions
  const allTags = Array.from(
    new Set(
      questions.flatMap((q) => q.body.match(/#\w+/g) || [])
    )
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {hydrated
          ? "Interactive ✓"
          : "Loading interactivity..."}
      </p>

      {/* Ask Question */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            className="kv-input flex-1 rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            suppressHydrationWarning
          />

          <button
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              type="button"
          >
            {loadingSuggestions ? "✨ Loading..." : "✨ AI Suggest"}
          </button>

            <button
              onClick={submit}
              className="btn-primary"
            >
            Ask
          </button>
        </div>

        {showSuggestions && (
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-gray-600 border-b border-gray-200 pb-2 mb-2">
              <span>✨ AI Suggested Questions</span>
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
                    onClick={() => {
                      setDraft(s);
                      setShowSuggestions(false);
                    }}
                    className="text-left text-xs p-2.5 rounded border border-gray-200 hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition text-gray-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search questions..."
          className="kv-input w-full"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "voted")}
          className="kv-input w-full sm:w-48 bg-white cursor-pointer"
        >
          <option value="recent">Sort by Recent</option>
          <option value="voted">Sort by Voted</option>
        </select>
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

      {/* Questions */}
      {/* Questions */}

{featuredCount >= 3 && (
  <div className="rounded-md border border-yellow-500 bg-yellow-500/10 p-3 text-sm text-yellow-300">
    Maximum 3 featured questions reached.
    Unpin a question to feature another.
  </div>
)}

<ul className="space-y-3">
        {sortedAndFiltered.map((q) => {
          const percentage =
            totalVotes > 0
              ? (
                  (q.votes / totalVotes) *
                  100
                ).toFixed(1)
              : "0";

          return (
            <li
              key={q.id}
              className="rounded-xl border bg-white p-4 shadow transition hover:shadow-md"
            >
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    upvote(q.id)
                  }
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-mono transition hover:bg-gray-100"
                >
                  ▲ {q.votes}
                </button>

<div className="flex-1">
  <div className="mb-2 flex items-center gap-2">
    {q.is_featured && (
      <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
        📌 Featured Question
      </span>
    )}

    <button
  onClick={() =>
    toggleFeatured(
      q.id,
      !!q.is_featured
    )
  }
  disabled={
    !q.is_featured &&
    featuredCount >= 3
  }
  className={`rounded px-2 py-1 text-xs transition ${
    !q.is_featured &&
    featuredCount >= 3
      ? "cursor-not-allowed border border-gray-600 text-gray-500"
      : "border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
  }`}
>
  {q.is_featured
    ? "📌 Unpin"
    : featuredCount >= 3
    ? "Limit Reached"
    : "📍 Pin"}
</button>
  </div>

  <p className="text-gray-900">
    {renderTextWithTags(q.body)}
  </p>

                  {q.author && (
                    <p className="mt-1 text-xs text-gray-500 font-medium">
                      by <span className="font-semibold text-gray-700">{q.author}</span>
                      {q.votes >= 10 && (
                        <span title="Top Contributor" className="ml-1 cursor-help">
                          🏆
                        </span>
                      )}
                    </p>
                  )}

                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-gray-400">
                    <span>
                      {percentage}% of all
                      votes
                    </span>

                    <span>
                      {q.votes} vote
                      {q.votes !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading
            ? "Loading..."
            : "Load More"}
        </button>
      )}
    </div>
  );
}