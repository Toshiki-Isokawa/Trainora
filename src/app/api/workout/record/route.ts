import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation (lightweight on purpose)
    if (!body.userId || !body.date || !body.workouts) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE_URL}/workout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Failed to record workout",
          detail: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Workout record API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
