"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const userId = session.user.userId;

    console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log("Fetching userId:", userId);

    if (!userId) {
      console.error("userId not found in session");
      return;
    }

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`);
        console.log("Response:", res.status);

        if (res.status === 200) {
          // User exists → Home
          router.replace("/");
          return;
        }

        if (res.status === 404) {
          // User not found → Registration
          router.replace("/onboarding/registration");
          return;
        }

        // Unexpected error
        console.error("Unexpected response:", res.status);
      } catch (err) {
        console.error("Failed to check user profile:", err);
      }
    };

    checkUser();
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      ログイン確認中...
    </div>
  );
}
