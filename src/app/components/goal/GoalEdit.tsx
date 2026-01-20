"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoalDraft } from "./GoalCreate";

const LOCAL_KEY = "onboarding:goal:draft";

export default function GoalEdit({ initialGoal }: { initialGoal: GoalDraft }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<GoalDraft>({
    goalType: "",
    duration: "",
    tempSaved: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      setDraft(JSON.parse(saved));
    } else {
      const next = { ...initialGoal, tempSaved: true };
      setDraft(next);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    }
  }, [initialGoal]);

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
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Goal Type */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">
          どのような目標ですか？
        </label>

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
        <label className="block mb-2 font-medium">
          どれくらいの期間で達成したいですか？
        </label>

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

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => persistAndGo("/onboarding/activity")}
          className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
          disabled={loading}
        >
          戻る
        </button>

        <button
          onClick={() => {
            const v = validate();
            if (v) {
              setError(v);
              return;
            }
            persistAndGo("/onboarding/summary");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
