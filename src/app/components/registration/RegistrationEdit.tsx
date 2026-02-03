"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DraftProfile } from "./RegistrationCreate";
import { RegistrationProfile } from "./types";
import { InputField } from "../InputField";

/* Edit existing user profile */

export default function RegistrationEdit({ initialProfile }: { initialProfile: RegistrationProfile; }) {

  const LOCAL_KEY = "onboarding:registration:draft";

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [draft, setDraft] = useState<DraftProfile>({
    name: initialProfile.name ?? "",
    birthDate: initialProfile.birthDate ?? "",
    gender: initialProfile.gender ?? "",
    height: initialProfile.height
      ? String(initialProfile.height)
      : "",
    weight: initialProfile.latestWeight
      ? String(initialProfile.latestWeight)
      : "",
    bodyFat: initialProfile.bodyFat
      ? String(initialProfile.bodyFat)
      : "",
    muscleMass: initialProfile.muscleMass
      ? String(initialProfile.muscleMass)
      : "",
    imageKey: initialProfile.imageKey ?? "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<DraftProfile>;
      setDraft((d) => ({ ...d, ...parsed }));
    } catch (e) {
      console.warn("Invalid registration draft", e);
    }
  }, []);

  /**
   * Fetch existing profile
   */
  useEffect(() => {
    if (initialProfile.profileImageUrl) {
      setImagePreview(initialProfile.profileImageUrl);
    }
  }, [initialProfile.profileImageUrl]);

  const update = (patch: Partial<DraftProfile>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
  };

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
   * Preview new image
   */
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleSaveDraft = () => {
    update({ tempSaved: true });
    setError(null);
  };

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

      const nextDraft = {
        ...draft,
        imageKey,
        tempSaved: false,
      };

      localStorage.setItem(
        "onboarding:registration:draft",
        JSON.stringify(nextDraft)
      );

      router.push("/onboarding/activity");
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

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

  if (initialLoading) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">
          アカウント情報の編集
        </h2>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Profile Image */}
      <section className="flex flex-col items-center gap-3">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>

        <label className="text-sm text-blue-600 font-medium cursor-pointer">
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

        {/* Two-column only on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="*身長 (cm)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.height}
              onChange={(e) => update({ height: e.target.value })}
            />
          </InputField>

          <InputField label="*体重 (kg)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.weight}
              onChange={(e) => update({ weight: e.target.value })}
            />
          </InputField>

          <InputField label="体脂肪率 (%)">
            <input
              className="input"
              inputMode="numeric"
              value={draft.bodyFat}
              onChange={(e) => update({ bodyFat: e.target.value })}
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

      {/* CTA */}
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
