"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputField } from "../InputField";

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
    <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">
          アカウント情報 — 基本情報
        </h2>
        <p className="text-sm text-gray-500">
          基本情報を入力してください
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Profile image */}
      <section className="flex flex-col items-center gap-3">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">
              No Image
            </span>
          )}
        </div>

        <label className="text-sm font-medium text-blue-600 cursor-pointer">
          画像を選択
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files?.[0] ?? null)
            }
            className="hidden"
          />
        </label>
      </section>

      {/* Form */}
      <section className="space-y-4">
        <InputField label="*名前">
          <input
            className="input"
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </InputField>

        <InputField label="*生年月日">
          <input
            type="date"
            className="input"
            value={draft.birthDate}
            onChange={(e) =>
              update({ birthDate: e.target.value })
            }
          />
        </InputField>

        <InputField label="*性別">
          <select
            className="input"
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
        </InputField>

        {/* Two columns only on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="*身長 (cm)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.height}
              onChange={(e) =>
                update({ height: e.target.value })
              }
            />
          </InputField>

          <InputField label="*体重 (kg)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.weight}
              onChange={(e) =>
                update({ weight: e.target.value })
              }
            />
          </InputField>

          <InputField label="体脂肪率 (%)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.bodyFat}
              onChange={(e) =>
                update({ bodyFat: e.target.value })
              }
            />
          </InputField>

          <InputField label="筋肉量 (kg)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.muscleMass}
              onChange={(e) =>
                update({ muscleMass: e.target.value })
              }
            />
          </InputField>
        </div>
      </section>

      {/* Actions */}
      <div className="pt-4">
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-white font-semibold disabled:opacity-50"
        >
          {loading ? "保存中..." : "次へ"}
        </button>
      </div>
    </main>
  );
}
