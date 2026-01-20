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
  if (profileLoading || submitting) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        集計中...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-bold text-red-600 mb-3">エラー</h2>
        <p className="mb-4">{error ?? "不明なエラーです。"}</p>
        <button
          onClick={() => router.push("/onboarding/registration")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          はじめからやり直す
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        目標に基づく推定カロリー
      </h2>

      <div className="bg-white shadow p-6 rounded-xl space-y-4 border">
        <div>
          <p className="text-gray-600">基礎代謝量 (BMR)</p>
          <p className="text-xl font-semibold">
            {result.summary.bmr} kcal
          </p>
        </div>

        <div>
          <p className="text-gray-600">1日の消費カロリー (TDEE)</p>
          <p className="text-xl font-semibold">
            {result.summary.tdee} kcal
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-gray-600">
            あなたの目標に合わせた推奨摂取カロリー
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {result.summary.recommendedCalories} kcal
          </p>
        </div>
      </div>

      <button
        onClick={handleFinish}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg"
      >
        完了してホームへ
      </button>
    </div>
  );
}
