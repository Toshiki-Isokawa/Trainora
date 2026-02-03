"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Pencil, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;

    await signOut({ redirect: false });

    const cognitoLogoutUrl =
      `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout` +
      `?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}` +
      `&logout_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!
      )}`;

    window.location.href = cognitoLogoutUrl;
  };

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Logo (clickable) */}
        <button
          onClick={() => router.push("/")}
          className="
            flex items-center gap-2
            text-white text-lg font-extrabold tracking-wide
            hover:opacity-80 transition
          "
        >
          ⚡ Trainora
        </button>

        {/* Actions (only when logged in) */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/onboarding/registration")}
              className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition"
            >
              <Pencil size={16} />
              <span className="hidden sm:inline">編集</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}