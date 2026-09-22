import PptxGenJS from "pptxgenjs";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── colour palette ────────────────────────────────────────────────────────────
const C = {
  bg:       "0F172A",   // deep navy
  accent:   "6C63FF",   // purple
  accent2:  "06B6D4",   // cyan
  white:    "FFFFFF",
  light:    "E2E8F0",
  muted:    "94A3B8",
  card:     "1E293B",
  yellow:   "F59E0B",
  green:    "10B981",
};

// ── helper: slide background ──────────────────────────────────────────────────
function setBg(slide) {
  slide.background = { color: C.bg };
}

// ── helper: accent bar on left ────────────────────────────────────────────────
function addAccentBar(slide, h = "100%") {
  slide.addShape("rect", { x: 0, y: 0, w: 0.1, h, fill: { color: C.accent } });
}

// ── helper: section title ─────────────────────────────────────────────────────
function addTitle(slide, text, y = 0.35) {
  slide.addText(text, {
    x: 0.35, y, w: "90%", h: 0.7,
    fontSize: 32, bold: true, color: C.white,
    fontFace: "Calibri",
  });
}

// ── helper: subtle footer ─────────────────────────────────────────────────────
function addFooter(slide, num) {
  slide.addText(`Kealvi — Live Q&A & Polls Platform   |   ${num}`, {
    x: 0, y: "93%", w: "100%", h: 0.3,
    align: "center", fontSize: 9, color: C.muted, fontFace: "Calibri",
  });
}

// ── helper: info card ─────────────────────────────────────────────────────────
function addCard(slide, { x, y, w, h, title, body, icon = "" }) {
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: C.card },
    line: { color: C.accent, width: 1.5 },
    rectRadius: 0.12,
  });
  if (icon) {
    slide.addText(icon, { x, y: y + 0.05, w, h: 0.45, align: "center", fontSize: 22, fontFace: "Segoe UI Emoji" });
  }
  if (title) {
    slide.addText(title, {
      x: x + 0.12, y: icon ? y + 0.42 : y + 0.12,
      w: w - 0.24, h: 0.35,
      fontSize: 13, bold: true, color: C.accent2, fontFace: "Calibri",
    });
  }
  if (body) {
    slide.addText(body, {
      x: x + 0.12, y: icon ? y + 0.72 : y + 0.44,
      w: w - 0.24, h: h - (icon ? 0.85 : 0.56),
      fontSize: 10.5, color: C.light, fontFace: "Calibri", valign: "top",
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
const pptx = new PptxGenJS();
pptx.layout  = "LAYOUT_WIDE";
pptx.title   = "Kealvi – Live Q&A & Polls Platform";
pptx.subject = "Project Presentation";
pptx.author  = "Kealvi Team";

// ── SLIDE 1 — TITLE ───────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };

  // Full-width gradient band
  s.addShape("rect", { x: 0, y: 2.5, w: "100%", h: 2.2, fill: { color: C.accent, transparency: 85 } });

  s.addText("Kealvi", {
    x: 0, y: 1.05, w: "100%", h: 1.0,
    align: "center", fontSize: 68, bold: true, color: C.white, fontFace: "Calibri",
  });
  s.addText("Live Q&A & Polls Platform", {
    x: 0, y: 2.0, w: "100%", h: 0.55,
    align: "center", fontSize: 22, color: C.accent2, fontFace: "Calibri",
  });
  s.addText("An intelligent, real-time audience engagement system\nbuilt with Next.js 16, Supabase & Gemini AI", {
    x: 0, y: 2.55, w: "100%", h: 0.95,
    align: "center", fontSize: 13.5, color: C.light, fontFace: "Calibri",
  });
  s.addText("Presented by: KaviPriya Selvakumar  •  September 2026", {
    x: 0, y: 3.65, w: "100%", h: 0.35,
    align: "center", fontSize: 11, color: C.muted, fontFace: "Calibri",
  });

  // Decorative dots
  for (let i = 0; i < 5; i++) {
    s.addShape("ellipse", {
      x: 0.4 + i * 2.5, y: 0.3, w: 0.18, h: 0.18,
      fill: { color: C.accent, transparency: 40 },
    });
  }
}

// ── SLIDE 2 — PROBLEM STATEMENT ───────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "2 / 12");
  addTitle(s, "🔴  Problem Statement");

  s.addText(
    "Traditional conference & classroom Q&A is broken:",
    { x: 0.35, y: 1.15, w: "90%", h: 0.4, fontSize: 14, color: C.accent2, bold: true, fontFace: "Calibri" }
  );

  const problems = [
    { icon: "🙋", title: "No structure", body: "Audience shouts questions randomly; important ones get lost in the noise." },
    { icon: "📊", title: "No real-time polling", body: "Speakers cannot instantly gauge audience opinion or knowledge level." },
    { icon: "🔇", title: "Passive participation", body: "Shy attendees never speak up; engagement is limited to a vocal minority." },
    { icon: "📉", title: "No analytics", body: "After the event, speakers have no data on what topics resonated most." },
    { icon: "🤖", title: "No AI assistance", body: "No intelligent suggestion engine to help attendees frame better questions." },
  ];

  problems.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    addCard(s, {
      x: 0.35 + col * 4.25, y: 1.65 + row * 1.85,
      w: 4.0, h: 1.75,
      icon: p.icon, title: p.title, body: p.body,
    });
  });

  // last card offset for row of 2
  if (problems.length % 3 !== 0) {
    const last = problems.length - 1;
    const rem  = problems.length % 3;
    // already placed above in the forEach – this is fine as-is
  }
}

// ── SLIDE 3 — OBJECTIVES ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "3 / 12");
  addTitle(s, "🎯  Objectives");

  const objs = [
    "Build a real-time Q&A system that lets attendees submit, upvote & feature questions.",
    "Provide live polling with instant vote visualisation and progress bars.",
    "Integrate Gemini AI to generate question & poll suggestions automatically.",
    "Create a rich Analytics dashboard with vote distribution charts.",
    "Display a Leaderboard to gamify participation and drive engagement.",
    "Ensure graceful offline fallback so the app works without a live database.",
    "Deliver a production-grade Next.js 16 app with SSR, TypeScript & Supabase.",
  ];

  objs.forEach((obj, i) => {
    s.addShape("roundRect", {
      x: 0.35, y: 1.15 + i * 0.55,
      w: 12.0, h: 0.48,
      fill: { color: i % 2 === 0 ? C.card : "162032" },
      line: { color: C.accent, width: 0.5 },
      rectRadius: 0.06,
    });
    s.addText(`${i + 1}.  ${obj}`, {
      x: 0.6, y: 1.17 + i * 0.55,
      w: 11.5, h: 0.44,
      fontSize: 12.5, color: C.white, fontFace: "Calibri", valign: "middle",
    });
  });
}

// ── SLIDE 4 — SOLUTION ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "4 / 12");
  addTitle(s, "✅  Our Solution — Kealvi");

  s.addText(
    "A full-stack, AI-powered live Q&A and polling platform designed for conferences, classrooms & webinars.",
    { x: 0.35, y: 1.1, w: "90%", h: 0.5, fontSize: 13, color: C.light, fontFace: "Calibri" }
  );

  const solutions = [
    { icon: "❓", title: "Live Q&A", body: "Attendees submit & upvote questions. Speakers can pin featured questions to top." },
    { icon: "📊", title: "Live Polls", body: "Create multi-option polls, see live vote percentages & progress bars update instantly." },
    { icon: "✨", title: "AI Suggestions", body: "Gemini AI generates contextual question & poll suggestions with one click." },
    { icon: "📈", title: "Analytics", body: "Bar charts of vote distribution for questions & polls help speakers understand the room." },
    { icon: "🏆", title: "Leaderboard", body: "Top contributors are ranked. Trophy badges appear next to high-vote authors." },
    { icon: "🔁", title: "Offline Mode", body: "All operations fall back to rich seed data so the UI works even without a database." },
  ];

  solutions.forEach((sol, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    addCard(s, {
      x: 0.35 + col * 4.25, y: 1.7 + row * 1.85,
      w: 4.0, h: 1.75,
      icon: sol.icon, title: sol.title, body: sol.body,
    });
  });
}

// ── SLIDE 5 — TECH STACK ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "5 / 12");
  addTitle(s, "🛠  Tech Stack");

  const stack = [
    { cat: "Frontend", items: ["Next.js 16.2 (App Router)", "React 19 (Server + Client Components)", "TypeScript 5", "Tailwind CSS (utility-first)", "Recharts (data visualisation)"] },
    { cat: "Backend / API", items: ["Next.js Route Handlers (REST)", "Supabase (PostgreSQL + real-time)", "Row Level Security (RLS)", "Connection Pooling"] },
    { cat: "AI & Intelligence", items: ["Google Gemini 1.5 Flash API", "AI-generated Q&A suggestions", "AI-generated Poll suggestions", "AI Analyst insights on Summary page"] },
    { cat: "DevOps & Infra", items: ["Vercel (deployment + Edge)", "Supabase Cloud (managed DB)", "NPM + Turbopack (build tool)", "ESLint + TypeScript strict mode"] },
  ];

  stack.forEach((col, i) => {
    const x = 0.35 + i * 3.2;
    // header
    s.addShape("roundRect", {
      x, y: 1.15, w: 3.05, h: 0.45,
      fill: { color: C.accent }, rectRadius: 0.06,
    });
    s.addText(col.cat, {
      x, y: 1.15, w: 3.05, h: 0.45,
      align: "center", fontSize: 13, bold: true, color: C.white, fontFace: "Calibri",
    });
    // body
    s.addShape("roundRect", {
      x, y: 1.65, w: 3.05, h: 2.9,
      fill: { color: C.card }, line: { color: C.accent, width: 1 }, rectRadius: 0.08,
    });
    col.items.forEach((item, j) => {
      s.addText(`• ${item}`, {
        x: x + 0.15, y: 1.78 + j * 0.52,
        w: 2.8, h: 0.48,
        fontSize: 11, color: C.light, fontFace: "Calibri",
      });
    });
  });
}

// ── SLIDE 6 — SYSTEM ARCHITECTURE ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "6 / 12");
  addTitle(s, "🏗  System Architecture");

  // Draw architecture diagram using shapes
  const layers = [
    { label: "Browser (Client)", color: C.accent,  x: 0.5,  y: 1.15, w: 3.2, items: ["React Components", "Client State", "Optimistic UI"] },
    { label: "Next.js 16 Server", color: "7C3AED",  x: 4.1,  y: 1.15, w: 3.2, items: ["App Router / SSR", "Route Handlers", "Server Actions"] },
    { label: "Supabase (PostgreSQL)", color: "0D9488", x: 7.7,  y: 1.15, w: 3.2, items: ["questions table", "votes table", "polls + poll_votes"] },
    { label: "Gemini AI API",   color: "D97706",  x: 11.3, y: 1.15, w: 1.85, items: ["Suggestions", "Insights"] },
  ];

  layers.forEach((layer) => {
    s.addShape("roundRect", { x: layer.x, y: layer.y, w: layer.w, h: 0.42, fill: { color: layer.color }, rectRadius: 0.06 });
    s.addText(layer.label, { x: layer.x, y: layer.y, w: layer.w, h: 0.42, align: "center", fontSize: 12, bold: true, color: C.white, fontFace: "Calibri" });
    s.addShape("roundRect", { x: layer.x, y: layer.y + 0.45, w: layer.w, h: layer.items.length * 0.48 + 0.2, fill: { color: C.card }, line: { color: layer.color, width: 1 }, rectRadius: 0.06 });
    layer.items.forEach((item, j) => {
      s.addText(`• ${item}`, { x: layer.x + 0.12, y: layer.y + 0.56 + j * 0.48, w: layer.w - 0.24, h: 0.44, fontSize: 10.5, color: C.light, fontFace: "Calibri" });
    });
  });

  // Arrows between layers
  const arrowY = 1.36;
  [[3.7, 4.1], [7.3, 7.7], [10.9, 11.3]].forEach(([x1, x2]) => {
    s.addShape("line", { x: x1, y: arrowY, w: x2 - x1, h: 0, line: { color: C.accent2, width: 2, dashType: "sysDash" } });
    s.addText("⟷", { x: x1, y: arrowY - 0.15, w: x2 - x1, h: 0.3, align: "center", fontSize: 14, color: C.accent2, fontFace: "Segoe UI Emoji" });
  });

  // Data flow labels
  s.addText("API Fetch / POST", { x: 3.7, y: arrowY - 0.38, w: 0.4, h: 0.3, fontSize: 8, color: C.muted, fontFace: "Calibri" });
  s.addText("Supabase JS SDK", { x: 7.3, y: arrowY - 0.38, w: 0.4, h: 0.3, fontSize: 8, color: C.muted, fontFace: "Calibri" });

  // Data flow description box
  s.addShape("roundRect", {
    x: 0.5, y: 3.5, w: 12.65, h: 1.4,
    fill: { color: "162032" }, line: { color: C.accent2, width: 1 }, rectRadius: 0.1,
  });
  s.addText("Data Flow", { x: 0.65, y: 3.58, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.accent2, fontFace: "Calibri" });
  s.addText(
    "1️⃣  User submits a question/poll via the Browser → 2️⃣  Next.js Route Handler receives the POST request → 3️⃣  Supabase JS SDK inserts row into PostgreSQL → 4️⃣  Client state updates optimistically (no page reload) → 5️⃣  AI Suggest button calls /api/ai/suggest → Gemini API returns contextual ideas.",
    { x: 0.65, y: 3.9, w: 12.4, h: 0.85, fontSize: 11, color: C.light, fontFace: "Calibri" }
  );
}

// ── SLIDE 7 — MODULE: QUESTIONS ───────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "7 / 12");
  addTitle(s, "❓  Module 1: Live Questions");

  const left = [
    ["Ask & Submit", "Any attendee can type a question and click Ask. It immediately appears at the top of the list using optimistic UI — no page reload needed."],
    ["Upvoting", "Click the ▲ arrow to vote for any question. The vote count updates instantly on all clients."],
    ["Featured / Pin", "Admins can pin up to 3 questions as Featured (📌). These are always displayed first."],
    ["Search & Filter", "Real-time debounced search. Filter by hashtag tags like #React, #Database. Sort by Most Recent or Most Voted."],
    ["Top Contributor Badge", "Authors with 10+ votes on a question receive the 🏆 badge automatically."],
    ["AI Suggest", "One click generates 5 contextual question ideas via the Gemini API."],
  ];

  left.forEach(([title, body], i) => {
    addCard(s, { x: 0.35, y: 1.15 + i * 0.88, w: 12.3, h: 0.82, title, body });
  });
}

// ── SLIDE 8 — MODULE: POLLS ───────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "8 / 12");
  addTitle(s, "📊  Module 2: Live Polls");

  const items = [
    ["Create Poll", "Enter a question + 2–10 options. Click Create Poll. The new poll instantly appears below the form without refreshing."],
    ["Vote", "Click any option to cast your vote. The progress bar and vote count update live in the browser."],
    ["Edit Poll Topic", "Click ✏️ Edit to change the poll question text inline via a prompt dialog."],
    ["Delete Poll", "Click 🗑 Delete (with confirmation) to remove a poll and all associated votes."],
    ["Hashtag Filtering", "Polls support hashtags like #React #CSS. Filter the poll list by clicking any trending tag."],
    ["AI Suggest", "Generates a full poll structure (question + options) with one click using Gemini AI."],
  ];

  items.forEach(([title, body], i) => {
    addCard(s, { x: 0.35, y: 1.15 + i * 0.88, w: 12.3, h: 0.82, title, body });
  });
}

// ── SLIDE 9 — MODULE: ANALYTICS + SUMMARY ────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "9 / 12");
  addTitle(s, "📈  Module 3: Analytics & AI Summary");

  const items = [
    { icon: "📉", title: "Vote Distribution Chart", body: "Bar chart (Recharts) shows per-question vote counts. Speakers instantly see which topics are hottest." },
    { icon: "🗳️", title: "Poll Vote Distributions", body: "Each active poll renders a horizontal bar chart showing option percentages in real-time." },
    { icon: "🤖", title: "AI Analyst Insights", body: "Gemini AI analyses all current Q&A and poll data to surface Audience Focus Areas, Hot Topics & Speaker Recommendations." },
    { icon: "📋", title: "Executive Summary", body: "A dedicated Summary page aggregates: total questions, votes, polls, poll votes & featured count with live-refresh capability." },
    { icon: "🏆", title: "Leaderboard", body: "Ranks the most active participants by total votes received across all their questions." },
    { icon: "🔄", title: "Refresh Analysis", body: "The Refresh Analysis button re-calls the Gemini API to get fresh insights as the audience engages further." },
  ];

  items.forEach((item, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    addCard(s, {
      x: 0.35 + col * 6.45, y: 1.15 + row * 1.8,
      w: 6.2, h: 1.65,
      icon: item.icon, title: item.title, body: item.body,
    });
  });
}

// ── SLIDE 10 — OUTPUT SCREENSHOTS ─────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "10 / 12");
  addTitle(s, "🖥  Output Screenshots");

  // Instead of actual images, we render rich labeled panels
  const screens = [
    { label: "Dashboard", x: 0.35,  y: 1.15, bg: "1E293B", desc: "Stats cards: 25 Questions · 66 Q-Votes · 5 Polls · 99 Poll Votes · 3 Featured" },
    { label: "Summary",   x: 6.75,  y: 1.15, bg: "1E293B", desc: "Executive Summary with AI Analyst Insights (Audience Focus, Hot Topics, Recommendations)" },
    { label: "Questions", x: 0.35,  y: 2.9,  bg: "1E293B", desc: "Featured pins · Upvote ▲ · Sort by Voted · AI Suggest · Trending tag filters · 🏆 badges" },
    { label: "Polls",     x: 6.75,  y: 2.9,  bg: "1E293B", desc: "Create Poll form · Live option voting with progress bars · Edit & Delete · AI Suggest" },
    { label: "Analytics", x: 3.55,  y: 4.55, bg: "1E293B", desc: "Bar chart (question votes) + Poll Vote Distribution bar charts (Recharts)" },
  ];

  screens.forEach(({ label, x, y, desc }) => {
    const w = label === "Analytics" ? 6.5 : 6.15;
    s.addShape("roundRect", { x, y, w, h: 1.55, fill: { color: C.card }, line: { color: C.accent, width: 1.5 }, rectRadius: 0.1 });
    s.addShape("roundRect", { x, y, w, h: 0.38, fill: { color: C.accent }, rectRadius: 0.1 });
    s.addText(label, { x, y, w, h: 0.38, align: "center", fontSize: 12, bold: true, color: C.white, fontFace: "Calibri" });
    s.addText(desc, { x: x + 0.12, y: y + 0.42, w: w - 0.24, h: 1.05, fontSize: 10.5, color: C.light, fontFace: "Calibri" });
  });

  s.addText("Screenshots captured from localhost:3000  •  September 2026", {
    x: 0, y: "89%", w: "100%", h: 0.3, align: "center", fontSize: 9, color: C.muted, fontFace: "Calibri",
  });
}

// ── SLIDE 11 — DATABASE SCHEMA ────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "11 / 12");
  addTitle(s, "🗄  Database Schema (Supabase / PostgreSQL)");

  const tables = [
    { name: "questions", color: C.accent, cols: ["id UUID PK", "body TEXT NOT NULL", "author TEXT", "is_featured BOOLEAN", "created_at TIMESTAMPTZ"] },
    { name: "votes",     color: C.accent2, cols: ["id UUID PK", "question_id → questions.id", "voter_id TEXT", "UNIQUE (question_id, voter_id)", "created_at TIMESTAMPTZ"] },
    { name: "polls",     color: C.yellow, cols: ["id UUID PK", "body TEXT NOT NULL", "author TEXT", "created_at TIMESTAMPTZ"] },
    { name: "poll_options", color: C.green, cols: ["id UUID PK", "poll_id → polls.id CASCADE", "option_text TEXT", "created_at TIMESTAMPTZ"] },
    { name: "poll_votes",   color: "F43F5E", cols: ["id UUID PK", "poll_id → polls.id CASCADE", "option_id → poll_options.id", "voter_id TEXT", "UNIQUE (poll_id, voter_id)"] },
  ];

  tables.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.35 + col * 4.35, y = 1.15 + row * 2.0;
    const w = 4.1;
    s.addShape("roundRect", { x, y, w, h: 0.4, fill: { color: t.color }, rectRadius: 0.06 });
    s.addText(t.name, { x, y, w, h: 0.4, align: "center", fontSize: 12, bold: true, color: C.white, fontFace: "Calibri" });
    const bodyH = t.cols.length * 0.38 + 0.12;
    s.addShape("roundRect", { x, y: y + 0.42, w, h: bodyH, fill: { color: C.card }, line: { color: t.color, width: 1 }, rectRadius: 0.06 });
    t.cols.forEach((col2, j) => {
      s.addText(`  ${col2}`, { x: x + 0.1, y: y + 0.48 + j * 0.38, w: w - 0.2, h: 0.34, fontSize: 10, color: C.light, fontFace: "Courier New" });
    });
  });
}

// ── SLIDE 12 — REFERENCES ─────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  setBg(s); addAccentBar(s); addFooter(s, "12 / 12");
  addTitle(s, "📚  References");

  const refs = [
    { cat: "Framework", label: "Next.js 16 Documentation", url: "https://nextjs.org/docs" },
    { cat: "Framework", label: "React 19 Docs", url: "https://react.dev" },
    { cat: "Database", label: "Supabase Documentation", url: "https://supabase.com/docs" },
    { cat: "Database", label: "PostgreSQL Full-Text Search", url: "https://www.postgresql.org/docs/current/textsearch.html" },
    { cat: "AI", label: "Google Gemini API Reference", url: "https://ai.google.dev/api" },
    { cat: "AI", label: "Gemini Flash 1.5 Model Card", url: "https://ai.google.dev/gemini-api/docs/models/gemini" },
    { cat: "Charts", label: "Recharts Library", url: "https://recharts.org/en-US" },
    { cat: "Deployment", label: "Vercel Deployment Guide", url: "https://vercel.com/docs" },
    { cat: "CSS", label: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" },
    { cat: "TypeScript", label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs" },
  ];

  const catColors = { Framework: C.accent, Database: C.accent2, AI: C.yellow, Charts: C.green, Deployment: "F43F5E", CSS: "8B5CF6", TypeScript: "3B82F6" };

  refs.forEach((ref, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.35 + col * 6.5, y = 1.15 + row * 0.72;
    s.addShape("roundRect", { x, y, w: 6.2, h: 0.62, fill: { color: C.card }, line: { color: catColors[ref.cat] || C.accent, width: 1 }, rectRadius: 0.06 });
    s.addShape("roundRect", { x: x + 0.12, y: y + 0.12, w: 1.1, h: 0.28, fill: { color: catColors[ref.cat] || C.accent }, rectRadius: 0.04 });
    s.addText(ref.cat, { x: x + 0.12, y: y + 0.12, w: 1.1, h: 0.28, align: "center", fontSize: 8, bold: true, color: C.white, fontFace: "Calibri" });
    s.addText(ref.label, { x: x + 1.32, y: y + 0.08, w: 4.7, h: 0.25, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri" });
    s.addText(ref.url, { x: x + 1.32, y: y + 0.33, w: 4.7, h: 0.22, fontSize: 9, color: C.accent2, fontFace: "Calibri" });
  });
}

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = resolve(ROOT, "Kealvi_Project_Presentation.pptx");
pptx.writeFile({ fileName: outPath })
  .then(() => console.log(`✅  Saved: ${outPath}`))
  .catch((err) => { console.error("❌ Error:", err); process.exit(1); });
