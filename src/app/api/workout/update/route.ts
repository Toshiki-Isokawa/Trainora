import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "API_BASE_URL is not defined" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { userId, date, workoutId, bodyParts, workouts } = body;

    if (!userId || !date || !workoutId || !bodyParts || !workouts) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE_URL}/workout`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        date,
        workoutId,
        bodyParts,
        workouts,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Workout update API error:", data);
      return NextResponse.json(
        { message: "Failed to update workout", error: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Workout update API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
