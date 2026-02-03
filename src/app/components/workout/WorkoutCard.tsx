"use client";

import { Plus, Trash2 } from "lucide-react";

type SetRecord = {
  weight: number | "";
  reps: number | "";
};

export type Workout = {
  menu: string;
  sets: SetRecord[];
};

type Props = {
  workout: Workout;
  onChange: (next: Workout) => void;
  onDelete: () => void;
};

export default function WorkoutCard({
  workout,
  onChange,
  onDelete,
}: Props) {

  const updateMenu = (value: string) => {
    onChange({
      ...workout,
      menu: value,
    });
  };

  const updateSet = (
    index: number,
    field: "weight" | "reps",
    value: number | ""
  ) => {
    const nextSets = workout.sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    );

    onChange({ ...workout, sets: nextSets });
  };

  const addSet = () => {
    onChange({
      ...workout,
      sets: [...workout.sets, { weight: "", reps: "" }],
    });
  };

  const removeSet = (index: number) => {
    onChange({
      ...workout,
      sets: workout.sets.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
        <input
            type="text"
            placeholder="種目名（例：ベンチプレス）"
            value={workout.menu}
            onChange={(e) => updateMenu(e.target.value)}
            className="
            flex-1 text-base font-semibold text-gray-800
            border-b border-gray-200
            focus:outline-none focus:border-blue-500
            pb-1
            "
        />

        <button
            onClick={onDelete}
            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
            <Trash2 size={18} />
        </button>
        </div>

        {/* Sets */}
        <div className="space-y-3">
        {workout.sets.map((set, index) => (
            <div
            key={index}
            className="flex items-center gap-2"
            >
            <span className="w-12 text-xs text-gray-500 shrink-0">
                {index + 1} セット
            </span>

            <input
                type="number"
                placeholder="kg"
                value={set.weight}
                onChange={(e) =>
                updateSet(
                    index,
                    "weight",
                    e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
                }
                className="flex-1 min-w-[70px] border rounded-lg px-3 py-2 text-sm"
            />

            <span className="text-sm text-gray-400">×</span>

            <input
                type="number"
                placeholder="回"
                value={set.reps}
                onChange={(e) =>
                updateSet(
                    index,
                    "reps",
                    e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
                }
                className="flex-1 min-w-[70px] border rounded-lg px-3 py-2 text-sm"
            />

            {workout.sets.length > 1 && (
                <button
                onClick={() => removeSet(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                <Trash2 size={14} />
                </button>
            )}
            </div>
        ))}
        </div>

        {/* Add Set */}
        <button
        onClick={addSet}
        className="
            flex items-center justify-center gap-1
            w-full rounded-lg border border-dashed
            py-2 text-sm font-medium text-blue-600
            hover:bg-blue-50 transition
        "
        >
        <Plus size={16} />
        セットを追加
        </button>
    </div>
    );
}
