"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export type WorkoutMode = "create" | "edit";

export function useWorkoutRecord(date: string) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<WorkoutMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<any>(null);

  const userId = session?.user?.userId;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !userId) {
      router.replace("/");
      return;
    }

    const detectMode = async () => {
      try {
        const res = await fetch(
          `/api/workout/fetch/date?userId=${userId}&date=${date}`
        );

        if (res.ok) {
            const data = await res.json();

            if (data.workouts && data.workouts.length > 0) {
                setMode("edit");
                setWorkoutData(data.workouts[0]);
            } else {
                setMode("create");
                setWorkoutData(null);
            }
        } else if (res.status === 404) {
          setMode("create");
        } else {
          throw new Error("failed to detect workout mode");
        }
      } catch (e) {
        console.error(e);
        setMode("create");
      } finally {
        setLoading(false);
      }
    };

    detectMode();
  }, [session, status, userId, date, router]);

  return {
    loading,
    mode,
    userId,
    workoutData,
  };
}
