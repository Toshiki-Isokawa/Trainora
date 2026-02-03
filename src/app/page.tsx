"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import HomeLoggedIn from "@/app/components/home/HomeLoggedIn";

export default function Home() {
  const { data: session, status } = useSession();

  // env 
  const redirectAfter = process.env.NEXT_PUBLIC_POST_LOGIN_REDIRECT ?? "/";
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!session) {
      setShowSplash(true);

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [session]);

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <h1 className="text-4xl sm:text-5xl font-bold text-white animate-pulse">
          Trainora
        </h1>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ============================
  // 未ログイン
  // ============================
  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Trainora</h1>
        <p className="mt-3 text-center text-gray-600 text-sm leading-relaxed">
          最高の人生を作る<br />
          トレーニングアプリ
        </p>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <button 
            onClick={() => 
              signIn("cognito", { 
                callbackUrl: redirectAfter
              })}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            ログイン
          </button>
          <button 
            onClick={() =>
              signIn("cognito", {
                callbackUrl: redirectAfter,
                authorizationParams: { 
                  screen_hint: "signup",
                },
              })
            }
            className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            新規登録
          </button>
        </div>
      </main>
    );
  }
  // ============================
  // ログイン済み Home
  // ============================

  return <HomeLoggedIn session={session} />;
}
