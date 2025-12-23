// app/api/upload-url/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "ap-northeast-1" });

export async function POST(req: Request) {
  const { filename, contentType } = await req.json();

  const key = `users/${Date.now()}-${filename}`;

  console.log("ASSETS_BUCKET =", process.env.ASSETS_BUCKET);

  const command = new PutObjectCommand({
    Bucket: process.env.ASSETS_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });

  return NextResponse.json({ url, key });
}
