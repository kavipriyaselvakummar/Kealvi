import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();

    if (q) {
      const questions = await searchQuestions(q, PAGE_SIZE);

      return Response.json({
        questions,
        hasMore: false,
      });
    }

    const offset = Number(searchParams.get("offset") ?? 0);

    const result = await getQuestionsPage(
      offset,
      PAGE_SIZE
    );

    return Response.json({
      questions: result.questions,
      hasMore: result.hasMore,
    });
  } catch (err: unknown) {
    console.error("GET /questions error:", err);

    return Response.json(
      {
        questions: [],
        hasMore: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const bodyData = await req.json().catch(() => null);

    if (!bodyData?.body) {
      return Response.json(
        { error: "Missing question body" },
        { status: 400 }
      );
    }

    const { body, author } = bodyData;

    let question;
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert({
          body,
          author: author ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      question = data;
    } catch (err) {
      question = {
        id: "mock-question-" + Date.now(),
        body,
        author: author ?? "Anonymous",
        is_featured: false,
        votes: 0
      };
    }

    return Response.json(question);
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}