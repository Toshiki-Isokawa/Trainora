"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type GoalDraft = {
  goalType: "" | "gain_both" | "gain_muscle" | "healthy_body" | "lose_fat";
  duration: "" | "3-4" | "5-6" | "6-7" | "7plus";
  tempSaved?: boolean;
};

const LOCAL_KEY = "onboarding:goal:draft";

export default function GoalCreate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<GoalDraft>({
    goalType: "",
    duration: "",
    tempSaved: true,
  });

  /** Restore local draft ONLY */
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return;

    try {
      setDraft(JSON.parse(saved));
    } catch {
      console.warn("invalid goal draft");
    }
  }, []);

  const update = (patch: Partial<GoalDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
  };

  const validate = () => {
    if (!draft.goalType) return "目標タイプを選択してください。";
    if (!draft.duration) return "目標期間を選択してください。";
    return null;
  };

  const persistAndGo = (path: string) => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ ...draft, tempSaved: false })
    );
    router.push(path);
  };

  const OptionButton = ({ active, onClick, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border ${
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
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>
      )}

      {/* Goal Type */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">どのような目標ですか？</label>
        <div className="flex flex-col gap-3">
          <OptionButton active={draft.goalType === "gain_both"} onClick={() => update({ goalType: "gain_both" })}>
            体重と筋肉量を増やしたい
          </OptionButton>
          <OptionButton active={draft.goalType === "gain_muscle"} onClick={() => update({ goalType: "gain_muscle" })}>
            筋肉量を増やしたい
          </OptionButton>
          <OptionButton active={draft.goalType === "healthy_body"} onClick={() => update({ goalType: "healthy_body" })}>
            健康的な身体を作りたい
          </OptionButton>
          <OptionButton active={draft.goalType === "lose_fat"} onClick={() => update({ goalType: "lose_fat" })}>
            体脂肪を落としたい
          </OptionButton>
        </div>
      </section>

      {/* Duration */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">期間</label>
        <div className="flex gap-3 flex-wrap">
          {["3-4", "5-6", "6-7", "7plus"].map((d) => (
            <OptionButton key={d} active={draft.duration === d} onClick={() => update({ duration: d as any })}>
              {d === "7plus" ? "7ヶ月以上" : `${d}ヶ月`}
            </OptionButton>
          ))}
        </div>
      </section>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => persistAndGo("/onboarding/activity")}
          className="px-4 py-2 bg-white border rounded"
          disabled={loading}
        >
          戻る
        </button>

        <button
          onClick={() => {
            const v = validate();
            if (v) return setError(v);
            persistAndGo("/onboarding/summary");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
