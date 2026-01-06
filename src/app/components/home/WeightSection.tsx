import WeightChart from "@/app/components/WeightChart";

export default function WeightSection({ weightHistory }: any) {
  return (
    <div>
      <WeightChart data={weightHistory} />
    </div>
  );
}
