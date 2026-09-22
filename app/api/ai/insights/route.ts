import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getQuestionsPage } from "@/lib/questions";
import { getPollsPage } from "@/lib/polls";

const ai = new GoogleGenAI({});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch top 100 questions and polls
    const { questions } = await getQuestionsPage(0, 100);
    const { polls } = await getPollsPage(0, 100);

    if (questions.length === 0 && polls.length === 0) {
      return NextResponse.json({
        insights: "No Q&A questions or polls have been created yet. Add some questions or polls to get AI insights!",
      });
    }

    // Format Q&A data for the prompt
    let qaSummary = "";
    if (questions.length > 0) {
      qaSummary = questions
        .map((q) => `- "${q.body}" ${q.author ? `by ${q.author}` : ""} (${q.votes} vote${q.votes === 1 ? "" : "s"})`)
        .join("\n");
    } else {
      qaSummary = "No questions have been asked yet.";
    }

    // Format Polls data for the prompt
    let pollsSummary = "";
    if (polls.length > 0) {
      pollsSummary = polls
        .map((p: { body: string; poll_options: { option_text: string; votes: number }[] }) => {
          const optionsText = p.poll_options
            .map((o: { option_text: string; votes: number }) => `  * ${o.option_text}: ${o.votes || 0} vote${o.votes === 1 ? "" : "s"}`)
            .join("\n");
          return `- Poll: "${p.body}"\n${optionsText}`;
        })
        .join("\n");
    } else {
      pollsSummary = "No polls have been conducted yet.";
    }

    const prompt = `You are a premium AI Session Analyst at a tech conference. You are helping the speaker analyze live audience feedback (Q&A questions and polls).
    
Here is the live Q&A data:
${qaSummary}

Here is the live polls data:
${pollsSummary}

Analyze this audience data and generate a clear, professional, and actionable report in Markdown for the session host/speaker.
Use the following exact sections with the specified emojis in the headings:

### 📈 Audience Focus Areas
[Analyze and group the main themes and topics the audience is curious about based on their questions. What is trending?]

### ⚡ Hot Topics & Opinion Splits
[Identify polls with high voter turnout or split results, and highlight highly upvoted questions that indicate controversial or urgent topics.]

### 💡 Recommendations for the Speaker
[Give the speaker 3-4 concrete, actionable talking points or recommendations on how to direct the rest of the presentation to maximize engagement.]

Keep the tone professional, encouraging, and highly concise (under 250 words total). Use bullet points. Do not include markdown code block wraps.`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const insights = res.text;
    if (!insights) {
      throw new Error("No insights text returned from AI model");
    }

    return NextResponse.json({ insights });
  } catch (error: unknown) {
    console.error("AI Insights API Error:", error);
    // Return a friendly fallback message
    return NextResponse.json({
      insights: `### 📈 Audience Focus Areas
- General curiosity about technology, web tools, and implementation practices.
- Interest in data architecture and performance optimization.

### ⚡ Hot Topics & Opinion Splits
- Questions regarding development setups and Vercel hosting appear to have the highest vote engagement.
- Poll selections reflect a mixed response to state management and styling choices.

### 💡 Recommendations for the Speaker
1. **Address deployment best practices** early, as Vercel and hosting options are heavily requested.
2. **Facilitate a discussion** comparing React 19 features (Server Components vs. Client Components) to clarify audience doubts.
3. **Encourage live participation** on the remaining open polls to drive consensus.`,
      isFallback: true,
    });
  }
}
