"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import BodyPartSelector from "../../components/workout/BodyPartSelector";
import { BodyPart } from "../../components/workout/BodyPartSelector";
import WorkoutCard from "../../components/workout/WorkoutCard";
import { Workout } from "../../components/workout/WorkoutCard";
import { useWorkoutRecord } from "../../hooks/useWorkoutRecord";

export default function WorkoutRecordPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;

  const { loading, mode, userId, workoutData } = useWorkoutRecord(date);
  
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !workoutData) return;

    console.log("Populating existing workout data:", workoutData);

    setBodyParts(workoutData.bodyParts);
    setWorkouts(workoutData.workouts);
    setWorkoutId(workoutData.workoutId);
    console.log("WorkoutId populated.", workoutData.workoutId);

  }, [mode, workoutData]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        Loading...
      </div>
    );
  }

  const addWorkout = () => {
    setWorkouts([
      ...workouts,
      {
        menu: "",
        sets: [{ weight: 0, reps: 0 }],
      },
    ]);
  };

  const updateWorkout = (index: number, updated: Workout) => {
    const next = [...workouts];
    next[index] = updated;
    setWorkouts(next);
  };

  const removeWorkout = (index: number) => {
    setWorkouts(workouts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (bodyParts.length === 0 || workouts.length === 0) {
      alert("部位と種目を入力してください");
      return;
    }

    setSaving(true);

    const res = await fetch(
      mode === "edit"
        ? "/api/workout/update"
        : "/api/workout/record",
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date,
          workoutId,
          bodyParts,
          workouts,
        }),
      }
    );

    setSaving(false);

    if (!res.ok) {
      alert("保存に失敗しました");
      return;
    }

    router.push("/");
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {mode === "edit"
            ? "トレーニング記録を編集"
            : "トレーニング記録"}
        </h1>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      {/* Body Parts */}
      <BodyPartSelector
        selected={bodyParts}
        onChange={setBodyParts}
      />

      {/* Workout Cards */}
      <div className="space-y-4">
        {workouts.map((workout, index) => (
          <WorkoutCard
            key={index}
            workout={workout}
            onChange={(updated) => updateWorkout(index, updated)}
            onDelete={() => removeWorkout(index)}
            />
        ))}
      </div>

      {/* Add Workout */}
      <button
        onClick={addWorkout}
        className="w-full border rounded-lg py-2 text-sm font-medium"
      >
        ＋ 種目を追加
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-black text-white rounded-lg py-3 font-semibold disabled:opacity-50"
      >
        {saving
          ? "保存中..."
          : mode === "edit"
          ? "更新する"
          : "保存する"}
      </button>
    </main>
  );
}
