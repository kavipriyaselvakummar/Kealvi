import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "question";

    let prompt = "";
    if (type === "question") {
      prompt = `Generate 3 diverse, highly engaging, and thought-provoking Q&A questions that participants might ask at a tech meetup or web development conference. 
      Keep them under 120 characters each. Avoid generic questions. Return the results in a JSON format matching this schema:
      {
        "suggestions": [
          "question string 1",
          "question string 2",
          "question string 3"
        ]
      }`;
    } else {
      prompt = `Generate 3 highly interactive, fun, or interesting polls suitable for web developers or tech enthusiasts.
      Each poll must have a question/topic (under 120 characters) and 2 to 4 distinct poll options (under 40 characters each).
      Return the results in a JSON format matching this schema:
      {
        "suggestions": [
          {
            "question": "Poll topic 1",
            "options": ["Option A", "Option B", "Option C"]
          },
          {
            "question": "Poll topic 2",
            "options": ["Option A", "Option B"]
          },
          {
            "question": "Poll topic 3",
            "options": ["Option A", "Option B", "Option C", "Option D"]
          }
        ]
      }`;
    }

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = res.text;
    if (!text) {
      throw new Error("Empty response from AI model");
    }

    const parsedData = JSON.parse(text);
    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error("AI Suggestion Route Error:", error);
    // Fallback static suggestions if Gemini call fails (e.g. key missing/offline)
    if (request.nextUrl.searchParams.get("type") === "poll") {
      return NextResponse.json({
        suggestions: [
          {
            question: "Which state management tool do you prefer for React?",
            options: ["Redux Toolkit", "Zustand", "Jotai", "React Context"],
          },
          {
            question: "How do you write your CSS in modern projects?",
            options: ["Tailwind CSS", "CSS Modules", "Styled Components", "Vanilla CSS"],
          },
          {
            question: "Will AI completely replace frontend developers in 5 years?",
            options: ["Yes, absolutely", "No, it is just a tool", "It will shift our role, not replace"],
          },
        ],
      });
    } else {
      return NextResponse.json({
        suggestions: [
          "How will React 19 Server Actions change backend architectures?",
          "What is the best strategy to optimize initial page loads in Next.js?",
          "When should we choose PostgreSQL over NoSQL databases for real-time applications?",
        ],
      });
    }
  }
}
