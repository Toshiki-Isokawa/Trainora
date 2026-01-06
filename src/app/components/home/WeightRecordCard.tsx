"use client";

import { useState } from "react";

type Props = {
  userId: string;
};

export default function WeightRecordCard({ userId }: Props) {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [submittingWeight, setSubmittingWeight] = useState(false);

  const [weightStatus, setWeightStatus] = useState<
    "success" | "exists" | "error" | null
  >(null);
  const [weightMessage, setWeightMessage] = useState<string | null>(null);

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
          userId,
          weight: Number(weightInput),
        }),
      });

      if (res.status === 200) {
        setWeightStatus("success");
        setWeightMessage("本日の体重を記録しました");
        setShowWeightForm(false);
        setWeightInput("");
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

  return (
    <div className="p-4 border rounded-lg space-y-3">
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
  );
}
