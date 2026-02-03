"use client";

export type BodyPart =
  | "chest"
  | "back"
  | "shoulder"
  | "arm"
  | "leg";

const BODY_PARTS: { key: BodyPart; label: string }[] = [
  { key: "chest", label: "胸" },
  { key: "back", label: "背中" },
  { key: "shoulder", label: "肩" },
  { key: "arm", label: "腕" },
  { key: "leg", label: "脚" },
];

type Props = {
  selected: BodyPart[];
  onChange: (next: BodyPart[]) => void;
};

export default function BodyPartSelector({ selected, onChange }: Props) {
  const toggle = (part: BodyPart) => {
    if (selected.includes(part)) {
      onChange(selected.filter((p) => p !== part));
    } else {
      onChange([...selected, part]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {BODY_PARTS.map((part) => {
          const active = selected.includes(part.key);

          return (
            <button
              key={part.key}
              type="button"
              onClick={() => toggle(part.key)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                transition-all
                ${
                  active
                    ? "bg-blue-600 text-white ring-2 ring-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {part.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}