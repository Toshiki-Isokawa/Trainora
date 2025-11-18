"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  // env (must be NEXT_PUBLIC_*)
  const redirectAfter = process.env.NEXT_PUBLIC_POST_LOGIN_REDIRECT ?? "/";

   useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2秒表示
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <h1 className="text-5xl font-bold text-white animate-pulse">
          Trainora
        </h1>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Trainora</h1>
      <p className="mt-4 text-lg text-gray-600">最高の人生を作るトレーニングアプリ</p>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => signIn("cognito", { callbackUrl: redirectAfter })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
        >
          新規登録
        </button>
      </div>
    </main>
  );
}
