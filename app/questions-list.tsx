"use client";

import { useEffect, useState } from "react";
import { getVoterId } from "@/lib/voter";
import { getCurrentUser } from "@/lib/auth";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  is_featured?: boolean;
};

type Comment = {
  id: string;
  author: string;
  text: string;
  time: string;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [sortBy, setSortBy] = useState<"recent" | "voted">("recent");
  const [loading, setLoading] = useState(false);

  // AI Suggestion & Hashtag Filtering states
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Question Card Options states: Comments, Answered status, Share feedback
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    "1": [{ id: "c1", author: "Marcus", text: "Vercel CLI or Git integration is super seamless!", time: "10m ago" }],
    "2": [{ id: "c2", author: "Priya", text: "Server components run on server, client components run in browser hydration.", time: "15m ago" }],
  });
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [answeredIds, setAnsweredIds] = useState<string[]>(["1"]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const timeout = setTimeout(async () => {
      try {
        const url = query
          ? `/api/questions?q=${encodeURIComponent(query)}`
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

    const user = getCurrentUser();
    const authorName = user?.name || "Anonymous";

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: draft,
          author: authorName,
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
          author: authorName,
          votes: 1,
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
    // Optimistic UI upvote increment
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );

    try {
      await fetch(`/api/questions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: getVoterId() }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  function downvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: Math.max(0, q.votes - 1) } : q))
    );
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, is_featured: !current } : q))
      );

      await fetch(`/api/questions/${id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  function toggleAnswered(id: string) {
    setAnsweredIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleShare(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function deleteQuestion(id: string) {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions((qs) => qs.filter((q) => q.id !== id));
    }
  }

  function addComment(qId: string) {
    if (!commentDraft.trim()) return;
    const user = getCurrentUser();
    const newComment: Comment = {
      id: "c-" + Date.now(),
      author: user?.name || "Attendee",
      text: commentDraft.trim(),
      time: "Just now",
    };
    setComments((prev) => ({
      ...prev,
      [qId]: [...(prev[qId] || []), newComment],
    }));
    setCommentDraft("");
  }

  async function loadMore() {
    try {
      setLoading(true);
      const res = await fetch(`/api/questions?offset=${questions.length}`);
      const data = await res.json();
      setQuestions((qs) => [...qs, ...(data.questions ?? [])]);
      setHasMore(data.hasMore ?? false);
    } finally {
      setLoading(false);
    }
  }

  const sortedAndFiltered = (() => {
    let result = [...questions];
    if (selectedTag) {
      result = result.filter((q) => q.body.includes(selectedTag));
    }
    result.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (sortBy === "voted") return b.votes - a.votes;
      return 0;
    });
    return result;
  })();

  const featuredCount = questions.filter((q) => q.is_featured).length;

  const allTags = Array.from(
    new Set(questions.flatMap((q) => q.body.match(/#\w+/g) || []))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Ask Question Card */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 16px" }}>
          ❓ Ask a Question
        </h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question here... (use #tags for topics)"
            className="kv-input"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />

          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--foreground)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loadingSuggestions ? "✨ Loading..." : "✨ AI Suggest"}
          </button>

          <button
            type="button"
            onClick={submit}
            className="btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            Ask Question
          </button>
        </div>

        {/* AI Suggestions Box */}
        {showSuggestions && (
          <div style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)" }}>
                ✨ AI Suggested Questions
              </span>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {aiSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDraft(s);
                    setShowSuggestions(false);
                  }}
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: "13px",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search and Sort Toolbar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search questions by keyword or #tag..."
            className="kv-input"
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "voted")}
            className="kv-input"
            style={{ width: "160px", cursor: "pointer" }}
          >
            <option value="recent">Most Recent</option>
            <option value="voted">Most Voted</option>
          </select>
        </div>
      </div>

      {/* Trending Tags Bar */}
      {allTags.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Trending Tags:</span>
          {allTags.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isActive ? null : tag)}
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: isActive ? "var(--accent)" : "var(--surface)",
                  color: isActive ? "#ffffff" : "var(--foreground)",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tag}
              </button>
            );
          })}
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              style={{ fontSize: "12px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sortedAndFiltered.map((q) => {
          const isAnswered = answeredIds.includes(q.id);
          const qComments = comments[q.id] || [];
          const isCommentsOpen = openCommentId === q.id;
          const initialLetter = q.author ? q.author.charAt(0).toUpperCase() : "A";

          return (
            <div
              key={q.id}
              style={{
                background: "var(--surface)",
                border: q.is_featured ? "2px solid #f59e0b" : "1px solid var(--border)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                transition: "all 0.15s ease",
              }}
            >
              {/* Card Header Badges & Author */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {initialLetter}
                  </div>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                      {q.author || "Anonymous"}
                    </span>
                    {q.votes >= 10 && (
                      <span title="Top Contributor" style={{ marginLeft: "6px", cursor: "help" }}>🏆</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {q.is_featured && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#fef3c7",
                      color: "#b45309",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid #fde68a",
                    }}>
                      📌 Featured
                    </span>
                  )}
                  {isAnswered ? (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid #86efac",
                    }}>
                      ✅ Answered
                    </span>
                  ) : (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      background: "var(--surface2)",
                      color: "var(--muted)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}>
                      Open Q&amp;A
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body Text */}
              <p style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--foreground)",
                margin: 0,
                lineHeight: "1.5",
              }}>
                {renderTextWithTags(q.body)}
              </p>

              {/* Question Options & Actions Toolbar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "12px",
                borderTop: "1px solid var(--border)",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                {/* Vote Buttons Group */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => upvote(q.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid var(--accent)",
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "transform 0.1s",
                    }}
                  >
                    👍 Upvote <span style={{ background: "var(--accent)", color: "#fff", padding: "1px 7px", borderRadius: "10px", fontSize: "11px" }}>{q.votes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downvote(q.id)}
                    title="Downvote"
                    style={{
                      padding: "6px 10px",
                      borderRadius: "20px",
                      border: "1px solid var(--border)",
                      background: "var(--surface2)",
                      color: "var(--muted)",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    👎
                  </button>
                </div>

                {/* Question Options: Reply, Pin, Mark Answered, Share, Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setOpenCommentId(isCommentsOpen ? null : q.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--surface2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }}
                  >
                    💬 Replies ({qComments.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(q.id, !!q.is_featured)}
                    disabled={!q.is_featured && featuredCount >= 3}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: q.is_featured ? "#fef3c7" : "var(--surface2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: q.is_featured ? "#b45309" : "var(--foreground)",
                      cursor: "pointer",
                    }}
                  >
                    {q.is_featured ? "📌 Unpin" : "📍 Pin"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAnswered(q.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: isAnswered ? "#dcfce7" : "var(--surface2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isAnswered ? "#15803d" : "var(--foreground)",
                      cursor: "pointer",
                    }}
                  >
                    {isAnswered ? "✅ Answered" : "⏳ Mark Answered"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(q.id, q.body)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--surface2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }}
                  >
                    {copiedId === q.id ? "✓ Copied!" : "🔗 Share"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    title="Delete Question"
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid #fee2e2",
                      background: "#fff5f5",
                      color: "var(--danger)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Collapsible Comment / Reply Thread */}
              {isCommentsOpen && (
                <div style={{
                  paddingTop: "14px",
                  borderTop: "1px dashed var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>
                    Discussion Thread ({qComments.length})
                  </div>

                  {qComments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "var(--surface2)",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <strong style={{ color: "var(--foreground)" }}>{c.author}</strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{c.time}</span>
                      </div>
                      <p style={{ margin: 0, color: "var(--muted)" }}>{c.text}</p>
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Add a reply..."
                      className="kv-input"
                      style={{ fontSize: "12.5px" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addComment(q.id);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addComment(q.id)}
                      className="btn-primary"
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "12px", marginTop: "12px" }}
        >
          {loading ? "Loading..." : "Load More Questions"}
        </button>
      )}
    </div>
  );
}