"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export type OnboardingMode = "create" | "edit";

export function useOnboardingProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<OnboardingMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const userId = session?.user?.userId;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !userId) {
      router.replace("/");
      return;
    }

    const detectMode = async () => {
      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`);

        if (res.ok) {
          const data = await res.json();
          setMode("edit");
          setProfileData(data);
        } else if (res.status === 404) {
          setMode("create");
        } else {
          throw new Error("failed to detect onboarding mode");
        }
      } catch (e) {
        console.error(e);
        setMode("create");
      } finally {
        setLoading(false);
      }
    };

    detectMode();
  }, [session, status, userId, router]);

  return {
    loading,
    mode,
    userId,
    profileData, // full API response
  };
}
