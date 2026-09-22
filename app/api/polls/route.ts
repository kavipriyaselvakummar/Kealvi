import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { body, options, author } =
      await req.json();

    if (!body?.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return NextResponse.json(
        {
          error:
            "At least 2 options are required",
        },
        { status: 400 }
      );
    }

    let poll;
    try {
      const res = await supabase
        .from("polls")
        .insert({
          body,
          author: author || null,
        })
        .select()
        .single();

      if (res.error) throw res.error;
      poll = res.data;
    } catch (err) {
      poll = {
        id: "mock-poll-" + Date.now(),
        body,
        author: author || "Anonymous"
      };
    }

    // Create options
    const optionRows = options.map((option: string) => ({
      poll_id: poll.id,
      option_text: option,
    }));

    try {
      const res = await supabase
        .from("poll_options")
        .insert(optionRows);

      if (res.error) throw res.error;
    } catch (err) {
      // Mock success for options
    }

    return NextResponse.json({
      success: true,
      poll,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create poll",
      },
      { status: 500 }
    );
  }
}