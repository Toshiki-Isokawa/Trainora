"use client";

import { useRouter } from "next/navigation";
import GoalCreate from "@/app/components/goal/GoalCreate";
import GoalEdit from "@/app/components/goal/GoalEdit";
import { useOnboardingProfile } from "@/app/hooks/useOnboardingProfile";

export default function GoalPage() {
  const router = useRouter();
  const { loading, mode, profileData } = useOnboardingProfile();

  if (loading || !mode) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  if (mode == "edit" && !profileData) {
    return <div className="flex justify-center mt-20">Invalid session</div>;
  }

  if (mode === "create") {
    return <GoalCreate />;
  }

  return (
    <GoalEdit
      initialGoal={{
        goalType: profileData.user.goal?.goalType ?? "",
        duration: "",
      }}
    />
  );
}
