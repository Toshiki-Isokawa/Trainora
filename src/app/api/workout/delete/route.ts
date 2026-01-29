import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, date, workoutId } = body;

    if (!userId || !date || !workoutId) {
      return NextResponse.json(
        { error: "Missing userId, date, or workoutId" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE_URL}/workout`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        date,
        workoutId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Workout delete API error:", text);
      return NextResponse.json(
        { error: "Failed to delete workout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Workout delete route error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}