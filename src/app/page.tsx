"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import WeightChart from "@/app/components/WeightChart";

type UserProfileResponse = {
  user: {
    name: string;
    goal: { goalType: string };
    summary: {
      recommendedCalories: number;
    };
    profile?: {
      signedImageUrl?: string | null;
    };
  };
  latestWeight: {
    weight: number;
  } | null;
};

type WeightItem = {
  date: string;
  weight: number;
};

type Range = "7d" | "30d" | "90d" | "all";

export default function Home() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [weightStatus, setWeightStatus] = useState<
    "success" | "exists" | "error" | null
  >(null);
  const [weightMessage, setWeightMessage] = useState<string | null>(null);
  const [submittingWeight, setSubmittingWeight] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightItem[]>([]);
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("7d");

  // env 
  const redirectAfter = process.env.NEXT_PUBLIC_POST_LOGIN_REDIRECT ?? "/";
  const userId = session?.user.userId;

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await signOut({ redirect: false });

      if (!process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI) {
        console.error("Missing NEXT_PUBLIC_LOGOUT_REDIRECT_URI");
        return;
      }
      const cognitoLogoutUrl =
      `${process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URL}` +
      `?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}` +
      `&logout_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!
      )}`;

      window.location.href = cognitoLogoutUrl;
    }
  };

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const res = await fetch(`/api/user/profile?userId=${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      console.log("Fetched profile:", data);
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [status, session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2秒表示
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchWeight = async () => {
      setLoadingWeight(true);
      setWeightError(null);

      try {
        const res = await fetch(
          `/api/weight/receive?userId=${userId}`
        );

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }

        const data = await res.json();
        setWeightHistory(data.items);
      } catch (e: any) {
        console.error(e);
        setWeightError("体重履歴の取得に失敗しました");
      } finally {
        setLoadingWeight(false);
      }
    };

    fetchWeight();
  }, []);

  const submitDailyWeight = async () => {
    if (!weightInput || isNaN(Number(weightInput))) {
      setWeightStatus("error");
      setWeightMessage("正しい体重を入力してください");
      return;
    }

    setSubmittingWeight(true);
    setWeightStatus(null);
    setWeightMessage(null);

    try {
      const res = await fetch("/api/weight/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          weight: Number(weightInput),
        }),
      });

      if (res.status === 200) {
        setWeightStatus("success");
        setWeightMessage("本日の体重を記録しました");
        setShowWeightForm(false);
        setWeightInput("");

        // refetch profile / latestWeight
        // await refetchProfile();

      } else if (res.status === 409) {
        setWeightStatus("exists");
        setWeightMessage("本日の体重はすでに記録されています");
      } else {
        const data = await res.json();
        setWeightStatus("error");
        setWeightMessage(data?.error ?? "保存に失敗しました");
      }
    } catch (e) {
      console.error(e);
      setWeightStatus("error");
      setWeightMessage("通信エラーが発生しました");
    } finally {
      setSubmittingWeight(false);
    }
  };

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <h1 className="text-5xl font-bold text-white animate-pulse">
          Trainora
        </h1>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  // ============================
  // 未ログイン
  // ============================
  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Trainora</h1>
        <p className="mt-4 text-lg text-gray-600">最高の人生を作るトレーニングアプリ</p>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => 
              signIn("cognito", { 
                callbackUrl: redirectAfter
              })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
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
  const welcome = "おかえりなさい、" + (profile?.user.name ?? "") + "さん！";

  const GOAL_LABELS: Record<string, string> = {
    gain_muscle: "筋肉量を増やしたい",
    gain_both: "体重と筋肉量を増やしたい",
    healthy_body: "健康的な身体を作りたい",
    lose_fat: "体脂肪を落としたい",
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Profile Image */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {profile?.user.profile?.signedImageUrl? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.profile.signedImageUrl}
                alt="プロフィール画像"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">No Image</span>
            )}
          </div>

          {/* Welcome */}
          <h1 className="text-xl font-bold">{welcome}</h1>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ログアウト
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">現在の目標</p>
          <p className="font-semibold">
            {profile?.user.goal.goalType
              ? GOAL_LABELS[profile.user.goal.goalType] ?? "未設定"
              : "未設定"}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">最新の体重</p>
          <p className="font-semibold">
            {profile?.latestWeight
              ? `${profile.latestWeight.weight} kg`
              : "未登録"}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">推奨摂取カロリー</p>
          <p className="font-semibold">
            {profile?.user.summary.recommendedCalories} kcal / 日
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loadingWeight && <p className="text-sm text-gray-500">読み込み中...</p>}
        {weightError && <p className="text-sm text-red-500">{weightError}</p>}
        <WeightChart data={weightHistory} />
      </div>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">体重の記録</p>

            <button
              onClick={() => {
                setShowWeightForm((v) => !v);
                setWeightStatus(null);
                setWeightMessage(null);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {showWeightForm ? "キャンセル" : "体重を記録する"}
            </button>
          </div>

          {showWeightForm && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                placeholder="例: 65.4"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-32 border rounded px-2 py-1"
              />

              <button
                onClick={submitDailyWeight}
                disabled={submittingWeight}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingWeight ? "保存中..." : "保存"}
              </button>
            </div>
          )}

          {weightMessage && (
            <p
              className={`text-sm ${
                weightStatus === "success"
                  ? "text-green-600"
                  : weightStatus === "exists"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {weightMessage}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
