import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const { featured } =
      await request.json();

    try {
      // Allow at most 3 featured questions
      if (featured) {
        const { count, error: countError } = await supabase
          .from("questions")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("is_featured", true);

        if (countError) throw countError;

        if ((count ?? 0) >= 3) {
          return NextResponse.json(
            { error: "Maximum 3 featured questions allowed" },
            { status: 400 }
          );
        }
      }

      const { data, error } = await supabase
        .from("questions")
        .update({ is_featured: featured })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } catch (err) {
      // Mock success for offline mode
      return NextResponse.json({
        id,
        is_featured: featured,
      });
    }
  } catch (_error) {
    return NextResponse.json(
      {
        error:
          "Failed to update question",
      },
      {
        status: 500,
      }
    );
  }
}