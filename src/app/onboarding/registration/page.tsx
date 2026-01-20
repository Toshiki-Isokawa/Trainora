"use client";

import RegistrationCreate from "@/app/components/registration/RegistrationCreate";
import RegistrationEdit from "@/app/components/registration/RegistrationEdit";
import { RegistrationProfile } from "@/app/components/registration/types";
import { useOnboardingProfile } from "@/app/hooks/useOnboardingProfile";


export default function RegistrationPage() {
  const { loading, mode, profileData } = useOnboardingProfile();

  if (loading || !mode) {
    return (
      <div className="flex justify-center mt-20">
        Loading...
      </div>
    );
  }

  if (mode == "edit" && !profileData) {
    return (
      <div className="flex justify-center mt-20">
        Invalid session
      </div>
    );
  }

  // ============================
  // Render
  // ============================

  if (mode === "create") {
    return <RegistrationCreate />;
  }

  if (!profileData) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  return <RegistrationEdit initialProfile={{
                            name: profileData.user.name,
                            birthDate: profileData.user.dateOfBirth,
                            gender: profileData.user.gender,
                            height: profileData.user.height,
                            latestWeight: profileData.latestWeight?.weight ?? null,
                            bodyFat: profileData.user.bodyFat ?? null,
                            muscleMass: profileData.user.muscleMass ?? null,
                            profileImageUrl: profileData.user.profile?.signedImageUrl ?? null,
                            imageKey: profileData.user.profile?.imageKey ?? null,
                      }} />;
}
