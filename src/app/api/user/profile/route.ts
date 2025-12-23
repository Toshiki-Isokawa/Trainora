// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile?userId=${userId}`
  );

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": "application/json",
    },
  });
}
