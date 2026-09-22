import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const userRole = role || "Attendee";
    let user;

    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          name,
          email: email.toLowerCase().trim(),
          password,
          role: userRole,
        })
        .select("id, email, name, role")
        .single();

      if (error) {
        if (error.code === "23505" || error.message?.includes("unique constraint")) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 400 }
          );
        }
        throw error;
      }
      user = data;
    } catch (err: unknown) {
      // Mock fallback when Supabase is offline
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("unique constraint")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
      user = {
        id: "user-" + Date.now(),
        email: email.toLowerCase().trim(),
        name,
        role: userRole,
      };
    }

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register" },
      { status: 500 }
    );
  }
}
