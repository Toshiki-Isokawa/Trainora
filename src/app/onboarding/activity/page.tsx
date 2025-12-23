"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActivityDraft = {
  workStyle: "" | "standing" | "desk";
  highIntensity: "" | "1-2" | "3-4" | "more";
  lowIntensity: "" | "1-2" | "3-4" | "more";
  tempSaved?: boolean;
};

const LOCAL_KEY = "onboarding:activity:draft";

export default function ActivityStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<ActivityDraft>({
    workStyle: "",
    highIntensity: "",
    lowIntensity: "",
    tempSaved: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        setDraft((d) => ({ ...d, ...(JSON.parse(saved) as ActivityDraft) }));
      } catch (e) {
        console.warn("invalid activity draft", e);
      }
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

  const handleSaveDraft = () => {
    update({ tempSaved: true });
    setError(null);
  };

  const handleBack = () => {
    router.push("/onboarding/step1");
  };

  const handleNext = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...draft, tempSaved: false };

      // Placeholder API - replace with your API Gateway/Lambda endpoint
      /* 
      const res = await fetch("/api/onboarding/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "保存に失敗しました");
      }

      // on success, clear local draft (or keep depending on flow)
      localStorage.removeItem(LOCAL_KEY);*/
      router.push("/onboarding/goal");
    } catch (e: any) {
      console.error(e);
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
      className={`px-3 py-2 rounded-lg border ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
      }`}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">日々の活動について</h2>

      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}

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

      <section className="mb-6">
        <label className="block mb-2 font-medium">高強度の運動頻度（筋トレなど）</label>
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

      <section className="mb-6">
        <label className="block mb-2 font-medium">低強度の運動頻度（散歩など）</label>
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
