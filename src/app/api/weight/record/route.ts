import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: Request) {
  try {
    // 1. Read body from frontend
    const body = await req.json();

    // 2. Forward request to API Gateway (Lambda)
    const upstreamRes = await fetch(
      `${API_BASE_URL}/weight/daily`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    // 3. Read response body 
    const text = await upstreamRes.text();

    // 4. Return response to browser
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("User register proxy error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
