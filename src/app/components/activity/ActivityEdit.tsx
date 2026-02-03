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
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition
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
        <h2 className="text-xl font-semibold">日々の活動について</h2>
        <p className="text-sm text-gray-500">
          日常の活動量を教えてください
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Work style */}
      <section className="space-y-3">
        <label className="block text-sm font-medium">
          仕事タイプ
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      <section className="space-y-3">
        <label className="block text-sm font-medium">
          高強度の運動頻度（筋トレなど）
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      <section className="space-y-3">
        <label className="block text-sm font-medium">
          低強度の運動頻度（散歩など）
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          onClick={handleBack}
          disabled={loading}
          className="w-full rounded-xl border py-3 text-sm font-medium sm:w-auto sm:px-5"
        >
          戻る
        </button>

        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-white font-semibold sm:ml-auto sm:w-auto sm:px-6"
        >
          次へ
        </button>
      </div>
    </main>
  );
}
