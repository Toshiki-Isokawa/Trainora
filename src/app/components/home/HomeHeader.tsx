"use client";

import { signOut } from "next-auth/react";

type UserProfileResponse = {
  user: {
    name: string;
    goal: { goalType: string };
    summary: {
      recommendedCalories: number;
    };
    profile?: {
      signedImageUrl?: string | null;
    };
  };
  latestWeight: {
    weight: number;
  } | null;
};

type Props = {
  profile: UserProfileResponse | null;
};

export default function HomeHeader({ profile }: Props) {
  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await signOut({ redirect: false });
    window.location.href =
      process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
          {profile?.user.profile?.signedImageUrl ? (
            <img
              src={profile.user.profile.signedImageUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>

        <h1 className="text-xl font-bold">
          おかえりなさい、{profile?.user.name}さん！
        </h1>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-gray-600"
      >
        ログアウト
      </button>
    </div>
  );
}
