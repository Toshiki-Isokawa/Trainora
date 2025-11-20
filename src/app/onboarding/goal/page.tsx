"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GoalDraft = {
  goalType:
    | ""
    | "gain_both"
    | "gain_muscle"
    | "healthy_body"
    | "lose_fat";
  duration: "" | "3-4" | "5-6" | "6-7" | "7plus";
  tempSaved?: boolean;
};

const LOCAL_KEY = "onboarding:goal:draft";

export default function GoalStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<GoalDraft>({
    goalType: "",
    duration: "",
    tempSaved: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        setDraft((d) => ({ ...d, ...(JSON.parse(saved) as GoalDraft) }));
      } catch (e) {
        console.warn("invalid goal draft", e);
      }
    }
  }, []);

  const update = (patch: Partial<GoalDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
  };

  const validate = (): string | null => {
    if (!draft.goalType) return "目標タイプを選択してください。";
    if (!draft.duration) return "目標期間を選択してください。";
    return null;
  };

  const handleBack = () => router.push("/onboarding/activity");

  const handleSaveDraft = () => {
    update({ tempSaved: true });
    setError(null);
  };

  const handleNext = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...draft, tempSaved: false };

      // Placeholder API
      const res = await fetch("/api/onboarding/goal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "保存に失敗しました");
      }

      localStorage.removeItem(LOCAL_KEY);
      router.push("/onboarding/summary");
    } catch (e: any) {
      setError(e.message || "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const OptionButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2 rounded-lg border transition ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">目標設定</h2>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Goal Type */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">どのような目標ですか？</label>
        <div className="flex flex-col gap-3">
          <OptionButton
            active={draft.goalType === "gain_both"}
            onClick={() => update({ goalType: "gain_both" })}
          >
            体重と筋肉量を増やしたい
          </OptionButton>

          <OptionButton
            active={draft.goalType === "gain_muscle"}
            onClick={() => update({ goalType: "gain_muscle" })}
          >
            筋肉量を増やしたい
          </OptionButton>

          <OptionButton
            active={draft.goalType === "healthy_body"}
            onClick={() => update({ goalType: "healthy_body" })}
          >
            健康的な身体を作りたい
          </OptionButton>

          <OptionButton
            active={draft.goalType === "lose_fat"}
            onClick={() => update({ goalType: "lose_fat" })}
          >
            体脂肪を落としたい
          </OptionButton>
        </div>
      </section>

      {/* Duration */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">どれくらいの期間で達成したいですか？</label>
        <div className="flex gap-3 flex-wrap">
          <OptionButton
            active={draft.duration === "3-4"}
            onClick={() => update({ duration: "3-4" })}
          >
            3〜4ヶ月
          </OptionButton>

          <OptionButton
            active={draft.duration === "5-6"}
            onClick={() => update({ duration: "5-6" })}
          >
            5〜6ヶ月
          </OptionButton>

          <OptionButton
            active={draft.duration === "6-7"}
            onClick={() => update({ duration: "6-7" })}
          >
            6〜7ヶ月
          </OptionButton>

          <OptionButton
            active={draft.duration === "7plus"}
            onClick={() => update({ duration: "7plus" })}
          >
            7ヶ月以上
          </OptionButton>
        </div>
      </section>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
          disabled={loading}
        >
          戻る
        </button>

        <button
          onClick={handleSaveDraft}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={loading}
        >
          下書き保存
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "保存中..." : "次へ"}
        </button>
      </div>
    </div>
  );
}
