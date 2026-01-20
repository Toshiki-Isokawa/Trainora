"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * First-time onboarding (create profile)
 */

export type DraftProfile = {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "male" | "female" | "other" | "";
  height: string; // cm (string for input)
  weight: string; // kg (string for input)
  bodyFat?: string;
  muscleMass?: string;
  imageKey?: string;
  tempSaved?: boolean;
};

const LOCAL_KEY = "onboarding:registration:draft";

export default function RegistrationCreate() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<DraftProfile>({
    name: "",
    birthDate: "",
    gender: "",
    height: "",
    weight: "",
    bodyFat: "",
    muscleMass: "",
    imageKey: "",
    tempSaved: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load draft from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as DraftProfile;
      setDraft((d) => ({ ...d, ...parsed }));
      if (parsed.imageKey) {
        setImagePreview(parsed.imageKey);
      }
    } catch (e) {
      console.warn("Invalid draft data", e);
    }
  }, []);

  /**
   * Preview uploaded image
   */
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  /**
   * Update draft + persist to localStorage
   */
  const update = (patch: Partial<DraftProfile>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
  };

  /**
   * Validation
   */
  const validateRequired = (): string | null => {
    if (!draft.name.trim()) return "名前を入力してください。";
    if (!draft.birthDate) return "生年月日を入力してください。";
    if (!draft.gender) return "性別を選択してください。";
    if (!draft.height || Number(draft.height) <= 0)
      return "身長を正しく入力してください。";
    if (!draft.weight || Number(draft.weight) <= 0)
      return "体重を正しく入力してください。";
    return null;
  };

  /**
   * Upload profile image
   */
  const uploadImage = async (file: File): Promise<string> => {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) throw new Error("画像アップロードURLの取得に失敗しました");

    const { url, key } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return key;
  };

  /**
   * Go to next onboarding step
   */
  const handleNext = async () => {
    setError(null);

    const validationError = validateRequired();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      let imageKey = draft.imageKey;

      if (imageFile) {
        imageKey = await uploadImage(imageFile);
        update({ imageKey });
      }

      const payload = {
        ...draft,
        imageKey,
      };

      localStorage.setItem(
        "onboarding:registration:draft",
        JSON.stringify(payload)
      );

      router.push("/onboarding/activity");
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">
        アカウント情報 — 基本情報
      </h2>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Profile image */}
      <div className="mb-4">
        <label className="block mb-1">プロフィール画像</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-500">No Image</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files?.[0] ?? null)
            }
          />
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block mb-1">*名前</label>
          <input
            className="w-full border rounded p-2"
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1">*生年月日</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={draft.birthDate}
            onChange={(e) =>
              update({ birthDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-1">*性別</label>
          <select
            className="w-full border rounded p-2"
            value={draft.gender}
            onChange={(e) =>
              update({
                gender: e.target.value as DraftProfile["gender"],
              })
            }
          >
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">*身長 (cm)</label>
          <input
            className="w-full border rounded p-2"
            inputMode="numeric"
            value={draft.height}
            onChange={(e) => update({ height: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1">*体重 (kg)</label>
          <input
            className="w-full border rounded p-2"
            inputMode="numeric"
            value={draft.weight}
            onChange={(e) => update({ weight: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1">体脂肪率 (%)</label>
          <input
            className="w-full border rounded p-2"
            inputMode="numeric"
            value={draft.bodyFat}
            onChange={(e) => update({ bodyFat: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1">筋肉量 (kg)</label>
          <input
            className="w-full border rounded p-2"
            inputMode="numeric"
            value={draft.muscleMass}
            onChange={(e) =>
              update({ muscleMass: e.target.value })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
         <button
          onClick={handleNext}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "保存中..." : "次へ"}
        </button>
      </div>
    </div>
  );
}
