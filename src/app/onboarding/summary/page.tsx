"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const REG_KEY = "onboarding:registration:draft";
const ACT_KEY = "onboarding:activity:draft";
const GOAL_KEY = "onboarding:goal:draft";

type SummaryResponse = {
    summary: {
        bmr: number;
        tdee: number;
        recommendedCalories: number;
    }
};

export default function SummaryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const userId = session.user.userId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SummaryResponse | null>(null);

    useEffect(() => {
    const loadAndCalculate = async () => {
        try {
        const reg = JSON.parse(localStorage.getItem(REG_KEY) ?? "{}");
        const act = JSON.parse(localStorage.getItem(ACT_KEY) ?? "{}");
        const goal = JSON.parse(localStorage.getItem(GOAL_KEY) ?? "{}");

        // Simple validation
        if (!reg.name || !reg.birthDate || !reg.height || !reg.weight) {
            throw new Error("個人情報が不完全です。最初からやり直してください。");
        }
        if (!act.workStyle || !act.highIntensity || !act.lowIntensity) {
            throw new Error("活動量情報が不完全です。");
        }
        if (!goal.goalType || !goal.duration) {
            throw new Error("目標設定が不完全です。");
        }

        const payload = {
            userId: userId, 
            name: reg.name,
            dateOfBirth: reg.birthDate,

            profile: {
                height: reg.height,
                weight: reg.weight,
                birthDate: reg.birthDate,
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
                targetWeight: goal.targetWeight,
            },
        };


        const res = await fetch(
            "/api/user/register",
            {
                method: "POST",
                headers: {
                "content-type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "サーバーエラーが発生しました。");
        }

        const data = (await res.json()) as SummaryResponse;
        setResult(data);
        } catch (e: any) {
        setError(e.message);
        } finally {
        setLoading(false);
        }
    };

    loadAndCalculate();
    }, []);

    const handleFinish = () => {
    localStorage.removeItem(REG_KEY);
    localStorage.removeItem(ACT_KEY);
    localStorage.removeItem(GOAL_KEY);
    router.push("/");
    };

    if (loading) {
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
            <h2 className="text-2xl font-bold mb-6">目標に基づく推定カロリー</h2>

            <div className="bg-white shadow p-6 rounded-xl space-y-4 border">
            <div>
                <p className="text-gray-600">基礎代謝量 (BMR)</p>
                <p className="text-xl font-semibold">{result.summary.bmr} kcal</p>
            </div>

            <div>
                <p className="text-gray-600">1日の消費カロリー (TDEE)</p>
                <p className="text-xl font-semibold">{result.summary.tdee} kcal</p>
            </div>

            <div className="border-t pt-4">
                <p className="text-gray-600">あなたの目標に合わせた推奨摂取カロリー</p>
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
