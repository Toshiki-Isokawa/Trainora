"use client";

import { useSearchParams } from "next/navigation";
import ActivityCreate from "@/app/components/activity/ActivityCreate";
import ActivityEdit from "@/app/components/activity/ActivityEdit";
import { ActivityDraft } from "@/app/components/activity/types";
import { useOnboardingProfile } from "@/app/hooks/useOnboardingProfile";

export default function ActivityPage() {
  const { loading, mode, profileData } = useOnboardingProfile();

  if (loading || !mode) {
    return (
      <div className="flex justify-center mt-20">
        Loading...
      </div>
    );
  }

  // -----------------------------
  // EDIT MODE
  // -----------------------------
  if (mode === "edit") {
    const initialActivity: ActivityDraft = {
      workStyle: profileData?.user?.activity?.workStyle ?? "",
      highIntensity: profileData?.user?.activity?.highIntensity ?? "",
      lowIntensity: profileData?.user?.activity?.lowIntensity ?? "",
    };

    return <ActivityEdit initialActivity={initialActivity} />;
  }

  // -----------------------------
  // CREATE MODE
  // -----------------------------
  return <ActivityCreate />;
}
