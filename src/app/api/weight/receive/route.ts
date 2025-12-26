import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

    const res = await fetch(
      `${apiBase}/weight/daily?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", 
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to fetch weight history" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Normalize for chart usage
    const items = (data.items ?? []).map((i: any) => ({
      date: i.date,
      weight: Number(i.weight),
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("weight/receive error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
