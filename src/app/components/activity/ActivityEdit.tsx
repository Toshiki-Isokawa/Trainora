"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityDraft, ACTIVITY_LOCAL_KEY } from "./types";

type Props = {
  initialActivity: ActivityDraft;
};

export default function ActivityEdit({ initialActivity }: Props) {

  const LOCAL_KEY = "onboarding:activity:draft";
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ActivityDraft>({
    workStyle: initialActivity.workStyle ?? "",
    highIntensity: initialActivity.highIntensity ?? "",
    lowIntensity: initialActivity.lowIntensity ?? "",
    tempSaved: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<ActivityDraft>;
      setDraft((d) => ({ ...d, ...parsed }));
    } catch (e) {
      console.warn("Invalid registration draft", e);
    }
  }, []);

  const update = (patch: Partial<ActivityDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
  };

  const validate = (): string | null => {
    if (!draft.workStyle) return "仕事タイプを選択してください。";
    if (!draft.highIntensity) return "高強度運動頻度を選択してください。";
    if (!draft.lowIntensity) return "低強度運動頻度を選択してください。";
    return null;
  };

  const handleBack = () => {

    try {
      const nextDraft = {
        ...draft,
        tempSaved: false,
      };
      localStorage.setItem(
        "onboarding:activity:draft",
        JSON.stringify(nextDraft)
      );
    }catch (e: any) {
      console.error(e);
      setError(e.message ?? "保存に失敗しました");
    } finally {
      setLoading(false);
    }
    
    router.push("/onboarding/registration");
  };

  const handleNext = () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {

      const nextDraft = {
        ...draft,
        tempSaved: false,
      };

      localStorage.setItem(
        "onboarding:activity:draft",
        JSON.stringify(nextDraft)
      );
    }catch (e: any) {
      console.error(e);
      setError(e.message ?? "保存に失敗しました");
    } finally {
      setLoading(false);
    }

    router.push("/onboarding/goal");
  };

  // Same OptionButton as Create
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
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      {children}
    </button>
  );

  // UI is IDENTICAL → reuse mentally, not via abstraction (yet)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">日々の活動について</h2>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Work style */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">仕事タイプ</label>
        <div className="flex gap-3">
          <OptionButton
            active={draft.workStyle === "standing"}
            onClick={() => update({ workStyle: "standing" })}
          >
            長時間の立ち仕事
          </OptionButton>
          <OptionButton
            active={draft.workStyle === "desk"}
            onClick={() => update({ workStyle: "desk" })}
          >
            デスクワーク中心
          </OptionButton>
        </div>
      </section>

      {/* High intensity */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">
          高強度の運動頻度（筋トレなど）
        </label>
        <div className="flex gap-3 flex-wrap">
          <OptionButton
            active={draft.highIntensity === "1-2"}
            onClick={() => update({ highIntensity: "1-2" })}
          >
            週に1〜2回
          </OptionButton>
          <OptionButton
            active={draft.highIntensity === "3-4"}
            onClick={() => update({ highIntensity: "3-4" })}
          >
            週に3〜4回
          </OptionButton>
          <OptionButton
            active={draft.highIntensity === "more"}
            onClick={() => update({ highIntensity: "more" })}
          >
            それ以上
          </OptionButton>
        </div>
      </section>

      {/* Low intensity */}
      <section className="mb-6">
        <label className="block mb-2 font-medium">
          低強度の運動頻度（散歩など）
        </label>
        <div className="flex gap-3 flex-wrap">
          <OptionButton
            active={draft.lowIntensity === "1-2"}
            onClick={() => update({ lowIntensity: "1-2" })}
          >
            週に1〜2回
          </OptionButton>
          <OptionButton
            active={draft.lowIntensity === "3-4"}
            onClick={() => update({ lowIntensity: "3-4" })}
          >
            週に3〜4回
          </OptionButton>
          <OptionButton
            active={draft.lowIntensity === "more"}
            onClick={() => update({ lowIntensity: "more" })}
          >
            それ以上
          </OptionButton>
        </div>
      </section>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white border rounded"
          disabled={loading}
        >
          戻る
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
