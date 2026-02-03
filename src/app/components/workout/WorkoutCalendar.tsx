"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Dumbbell, MoveVertical, ArrowUp, Footprints, Armchair } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import dayjs from "dayjs";

interface Props {
  userId: string;
}

const BODY_PART_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ size?: number }> }
> = {
  chest: {
    label: "胸",
    Icon: Dumbbell,
  },
  back: {
    label: "背中",
    Icon: MoveVertical,
  },
  shoulder: {
    label: "肩",
    Icon: ArrowUp,
  },
  arm: {
    label: "腕",
    Icon: Armchair,
  },
  leg: {
    label: "脚",
    Icon: Footprints,
  },
};

export default function WorkoutCalendar({ userId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [datesWithWorkout, setDatesWithWorkout] = useState<string[]>([]);
  const [dailyWorkouts, setDailyWorkouts] = useState<any[]>([]);
  const [loadingDate, setLoadingDate] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const monthKey = currentMonth.format("YYYY-MM");
  const router = useRouter();

   // Fetch workouts by MONTH
  useEffect(() => {
    const fetchMonth = async () => {
      const res = await fetch(
        `/api/workout/fetch/month?userId=${userId}&month=${monthKey}`
      );

      if (!res.ok) return;

      const data = await res.json();
      setDatesWithWorkout(data.datesWithWorkout ?? []);
    };

    fetchMonth();
    setSelectedDate(null);
    setDailyWorkouts([]);
  }, [userId, monthKey]);

  // Fetch workouts by DATE
  const fetchByDate = async (date: string) => {
    setSelectedDate(date);
    setLoadingDate(true);

    const res = await fetch(
      `/api/workout/fetch/date?userId=${userId}&date=${date}`
    );

    if (res.ok) {
      const data = await res.json();
      setDailyWorkouts(data.workouts ?? []);
    } else {
      setDailyWorkouts([]);
    }

    setLoadingDate(false);
  };

  const handleDeleteWorkout = async () => {
    if (!deleteTarget) return;

    try {
        setDeleting(true);

        await fetch("/api/workout/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            workoutId: deleteTarget.workoutId,
            date: selectedDate,
        }),
        });

        // Optimistically update UI
        setDailyWorkouts((prev) =>
        prev.filter((w) => w.workoutId !== deleteTarget.workoutId)
        );

        setDatesWithWorkout((prev) =>
        prev.filter((d) => d !== selectedDate)
        );

        setDeleteTarget(null);
    } catch (e) {
        alert("削除に失敗しました");
    } finally {
        setDeleting(false);
    }
  }; 

  const startOfMonth = currentMonth.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const days: (string | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(currentMonth.date(d).format("YYYY-MM-DD"));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="text-gray-500"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {currentMonth.format("YYYY / MM")}
        </h2>
        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="text-gray-500"
        >
          →
        </button>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-gray-400">
            {d}
          </div>
        ))}

        {days.map((date, idx) => {
          if (!date) {
            return <div key={idx} />;
          }

          const hasWorkout = datesWithWorkout.includes(date);
          const isSelected = selectedDate === date;

          return (
            <button
              key={date}
              onClick={() => fetchByDate(date)}
              className={`h-10 rounded-lg flex items-center justify-center transition
                ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : hasWorkout
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
            >
              {dayjs(date).date()}
            </button>
          );
        })}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-4 p-4 rounded-xl bg-gray-50 text-sm">
          <p className="font-medium">
            {dayjs(selectedDate).format("YYYY/MM/DD")}
          </p>

          {loadingDate ? (
            <p className="text-gray-400">Loading...</p>
          ) : dailyWorkouts.length === 0 ? (
            <p className="text-gray-500">記録なし</p>
          ) : (
            <ul className="space-y-1">
              {dailyWorkouts.map((w, idx) => (
                <li
                    key={w.workoutId}
                    className="text-sm text-gray-700 space-y-1"
                    >
                    <div className="flex items-center justify-between">
                        {/* Body parts with icons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {w.bodyParts.map((part: string) => {
                                const meta = BODY_PART_META[part];
                                if (!meta) return null;
                                const { label, Icon } = meta;
                                return (
                                    <div
                                    key={part}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-white text-gray-800 text-sm"
                                    >
                                    <Icon size={14} />
                                    <span>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Delete */}
                        <button
                            onClick={() => setDeleteTarget(w)}
                            className="text-gray-400 hover:text-red-500 transition"
                            aria-label="Delete workout"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    {/* Workouts */}
                    <div className="space-y-1 pl-2">
                        {w.workouts.map((ex: any, idx: number) => (
                        <div key={idx}>
                            {/* Exercise name */}
                            <div className="text-gray-800">
                            {ex.menu}
                            </div>

                            {/* Sets */}
                            <div className="text-xs text-gray-500 pl-3">
                            {ex.sets
                                .map(
                                (set: any) =>
                                    `${set.weight}kg × ${set.reps}`
                                )
                                .join(" / ")}
                            </div>
                        </div>
                        ))}
                    </div>
                </li>

              ))}
            </ul>
          )}

          <button 
            onClick={() => router.push(`/workout/${selectedDate}`)}
            className="mt-3 w-full py-2 rounded-lg bg-blue-500 text-white">
                {dailyWorkouts.length > 0 ? "記録を編集する" : "トレーニングを記録する"}
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="トレーニング記録を削除しますか？"
        description="この操作は取り消せません。"
        confirmText="削除する"
        cancelText="キャンセル"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteWorkout}
      />
    </div>
  );
}
