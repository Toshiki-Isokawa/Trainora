"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOnboardingProfile } from "@/app/hooks/useOnboardingProfile";

const REG_KEY = "onboarding:registration:draft";
const ACT_KEY = "onboarding:activity:draft";
const GOAL_KEY = "onboarding:goal:draft";

type SummaryResponse = {
  summary: {
    bmr: number;
    tdee: number;
    recommendedCalories: number;
  };
};

export default function SummaryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { loading: profileLoading, mode } = useOnboardingProfile();
  const [submitting, setSubmitting] = useState(false);

  //const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResponse | null>(null);

  function safeNumber(value: any): number | null {
    if (value === "" || value == null) return null;

    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }



  useEffect(() => {
    console.log("SummaryPage useEffect run, mode:", mode);
    if (status === "loading" || profileLoading || submitting) return;
    if (!session?.user?.userId) {
        throw new Error("ログイン情報が取得できません。");
    }


    const run = async () => {
      try {
        const reg = JSON.parse(localStorage.getItem(REG_KEY) ?? "{}");
        const act = JSON.parse(localStorage.getItem(ACT_KEY) ?? "{}");
        const goal = JSON.parse(localStorage.getItem(GOAL_KEY) ?? "{}");

        const height = safeNumber(reg.height);
        const weight = safeNumber(reg.weight);

        if (height == null || weight == null) {
          throw new Error("身長または体重が正しく入力されていません。");
        }

        // -----------------------------
        // Validation
        // -----------------------------
        if (!reg.name || !reg.birthDate || !reg.height || !reg.weight) {
          throw new Error("個人情報が不完全です。");
        }

        if (!act.workStyle || !act.highIntensity || !act.lowIntensity) {
          throw new Error("活動量情報が不完全です。");
        }

        if (!goal.goalType) {
          throw new Error("目標設定が不完全です。");
        }

        // -----------------------------
        // Payload
        // -----------------------------
        const payload = {
          userId: session.user.userId,
          name: reg.name,
          dateOfBirth: reg.birthDate,

          profile: {
            height: height,
            weight: weight,
            gender: reg.gender,
            imageKey: reg.imageKey ?? null,
          },

          activity: {
            workStyle: act.workStyle,
            highIntensity: act.highIntensity,
            lowIntensity: act.lowIntensity,
          },

          goal: {
            goalType: goal.goalType,
            duration: goal.duration,
          },
        };

        console.log("SummaryPage payload:", payload);

        const endpoint =
          mode === "edit"
            ? "/api/user/update"
            : "/api/user/register";

        const method = mode === "edit" ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "サーバーエラーが発生しました。");
        }

        const data = (await res.json()) as SummaryResponse;
        setResult(data);
      } catch (e: any) {
        setError(e.message ?? "不明なエラーが発生しました。");
      }
    };

    run();
  }, [status, session, profileLoading, mode]);

  const handleFinish = () => {
    localStorage.removeItem(REG_KEY);
    localStorage.removeItem(ACT_KEY);
    localStorage.removeItem(GOAL_KEY);
    router.push("/");
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (profileLoading || submitting || !result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg">
        <div className="animate-pulse">集計中...</div>
        <p className="text-sm text-gray-500">あなたに最適な数値を計算しています</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 space-y-6">
        <h2 className="text-xl font-bold text-red-600">エラー</h2>
        <p className="text-sm text-gray-700">
          {error ?? "不明なエラーです。"}
        </p>

        <button
          onClick={() => router.push("/onboarding/registration")}
          className="w-full rounded-xl bg-black py-3 text-white font-semibold"
        >
          はじめからやり直す
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">
          あなたの推定カロリー
        </h2>
        <p className="text-sm text-gray-500">
          目標・活動量・身体情報をもとに算出しました
        </p>
      </header>

      {/* Main result card */}
      <section className="rounded-2xl border bg-white p-6 space-y-6 shadow-sm">
        {/* Recommended */}
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">
            推奨摂取カロリー（1日）
          </p>
          <p className="text-3xl font-bold text-black">
            {result.summary.recommendedCalories}
            <span className="ml-1 text-base font-medium text-gray-600">
              kcal
            </span>
          </p>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500">基礎代謝量 (BMR)</p>
            <p className="font-semibold">
              {result.summary.bmr} kcal
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-gray-500">
              消費カロリー (TDEE)
            </p>
            <p className="font-semibold">
              {result.summary.tdee} kcal
            </p>
          </div>
        </div>
      </section>

      {/* Finish CTA */}
      <button
        onClick={handleFinish}
        className="w-full rounded-2xl bg-black py-4 text-white text-lg font-semibold"
      >
        完了してホームへ
      </button>

      {/* Sub text */}
      <p className="text-center text-xs text-gray-400">
        ※ 数値は目安です。体調に合わせて調整してください。
      </p>
    </main>
  );
}
