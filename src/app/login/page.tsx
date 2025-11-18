"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={() => signIn("cognito")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Sign In with Cognito
      </button>
    </div>
  );
}