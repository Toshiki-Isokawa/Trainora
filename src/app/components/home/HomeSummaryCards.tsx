const GOAL_LABELS: Record<string, string> = {
  gain_muscle: "筋肉量を増やしたい",
  gain_both: "体重と筋肉量を増やしたい",
  healthy_body: "健康的な身体を作りたい",
  lose_fat: "体脂肪を落としたい",
};

export default function HomeSummaryCards({ profile }: any) {
  return (
    <div className="space-y-4">
      <Card label="現在の目標">
        {GOAL_LABELS[profile?.user.goal.goalType] ?? "未設定"}
      </Card>

      <Card label="最新の体重">
        {profile?.latestWeight
          ? `${profile.latestWeight.weight} kg`
          : "未登録"}
      </Card>

      <Card label="推奨摂取カロリー">
        {profile?.user.summary.recommendedCalories} kcal / 日
      </Card>
    </div>
  );
}

function Card({ label, children }: any) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{children}</p>
    </div>
  );
}
