"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

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
  const router = useRouter();
  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    await signOut({ redirect: false });
    window.location.href =
      process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!;
  };

  const handleEditProfile = () => {
    router.push("/onboarding/registration");
  };

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm">
      {/* Left: Profile */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100">
          {profile?.user.profile?.signedImageUrl ? (
            <img
              src={profile.user.profile.signedImageUrl}
              alt="Profile image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-500">おかえりなさい</span>
          <h1 className="text-lg font-semibold">
            {profile?.user.name} さん
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Edit profile */}
        <button
          onClick={handleEditProfile}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <Pencil className="w-4 h-4" />
          編集
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
