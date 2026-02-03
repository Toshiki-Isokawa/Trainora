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
      className={`rounded-xl border px-4 py-4 text-left text-sm font-medium transition
        ${
          active
            ? "border-black bg-black text-white"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-6 space-y-8">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">目標設定</h2>
        <p className="text-sm text-gray-500">
          あなたのゴールを教えてください
        </p>
      </header>

      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Goal type */}
      <section className="space-y-3">
        <label className="block text-sm font-medium">
          どのような目標ですか？
        </label>

        <div className="grid grid-cols-1 gap-3">
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
      <section className="space-y-3">
        <label className="block text-sm font-medium">
          期間
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["3-4", "5-6", "6-7", "7plus"].map((d) => (
            <OptionButton
              key={d}
              active={draft.duration === d}
              onClick={() => update({ duration: d as any })}
            >
              {d === "7plus" ? "7ヶ月以上" : `${d}ヶ月`}
            </OptionButton>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          onClick={() => persistAndGo("/onboarding/activity")}
          disabled={loading}
          className="w-full rounded-xl border py-3 text-sm font-medium sm:w-auto sm:px-5"
        >
          戻る
        </button>

        <button
          onClick={() => {
            const v = validate();
            if (v) return setError(v);
            persistAndGo("/onboarding/summary");
          }}
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-white font-semibold sm:ml-auto sm:w-auto sm:px-6"
        >
          次へ
        </button>
      </div>
    </main>
  );
}
