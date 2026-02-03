"use client";

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
  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left: Profile */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
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

          {/* Name */}
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500 sm:text-sm">
              おかえりなさい
            </span>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">
              {profile?.user.name} さん
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
