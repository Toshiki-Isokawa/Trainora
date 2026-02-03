const GOAL_LABELS: Record<string, string> = {
  gain_muscle: "筋肉量を増やしたい",
  gain_both: "体重と筋肉量を増やしたい",
  healthy_body: "健康的な身体を作りたい",
  lose_fat: "体脂肪を落としたい",
};

export default function HomeSummaryCards({ profile }: any) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <SummaryCard label="現在の目標">
        {GOAL_LABELS[profile?.user.goal.goalType] ?? "未設定"}
      </SummaryCard>

      <SummaryCard label="最新の体重">
        {profile?.latestWeight
          ? `${profile.latestWeight.weight} kg`
          : "未登録"}
      </SummaryCard>

      <SummaryCard label="推奨摂取カロリー">
        {profile?.user.summary.recommendedCalories} kcal / 日
      </SummaryCard>
    </div>
  );
}

function SummaryCard({ label, children }: any) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {children}
      </p>
    </div>
  );
}
