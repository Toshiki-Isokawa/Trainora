export type WeightRecord = {
  date: string; // YYYY-MM-DD
  weight: number;
};

const today = new Date();
const DAYS = 120;

export const mockWeightHistory: WeightRecord[] = [];

let weight = 70;

for (let i = DAYS - 1; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);

  // simulate small daily fluctuation
  weight += (Math.random() - 0.5) * 0.2;

  mockWeightHistory.push({
    date: date.toISOString().slice(0, 10),
    weight: Number(weight.toFixed(1)),
  });
}
