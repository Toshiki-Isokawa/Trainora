"use client";

import { signIn } from "next-auth/react";

export default function AuthLanding() {
  const redirectAfter =
    process.env.NEXT_PUBLIC_POST_LOGIN_REDIRECT ?? "/";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Trainora</h1>
      <p className="mt-4 text-lg text-gray-600">
        最高の人生を作るトレーニングアプリ
      </p>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() =>
            signIn("cognito", { callbackUrl: redirectAfter })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ログイン
        </button>

        <button
          onClick={() =>
            signIn("cognito", {
              callbackUrl: redirectAfter,
              authorizationParams: { screen_hint: "signup" },
            })
          }
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          新規登録
        </button>
      </div>
    </main>
  );
}
