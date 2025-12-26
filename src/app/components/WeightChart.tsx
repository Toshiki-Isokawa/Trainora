"use client";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type DailyWeight = {
  date: string;
  weight: number;
};

export type WeightRecord = {
  date: string;
  weight: number;
};

type Props = {
  data: DailyWeight[];
};

type Range = "7d" | "30d" | "90d" | "all";

export default function WeightChart({ data }: Props) {
    const [range, setRange] = useState<Range>("7d");

    const filteredData = useMemo(() => {
        if (range === "all") return data;

            const days =
                range === "7d" ? 7 :
                range === "30d" ? 30 :
                90;

        return data.slice(-days);
    }, [data, range]);


    if (!data || data.length === 0) {
        return (
        <div className="p-6 border rounded-lg text-center text-gray-500">
            体重データがまだありません
        </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-sm text-gray-500 mb-2">体重の推移</h2>

            <div className="flex gap-2 mb-4">
                {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-3 py-1 rounded text-sm border ${
                            range === r
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600"
                            }`}
                        >
                        {r.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                        formatter={(value) => {
                            if (typeof value !== "number") return ["-", "体重"];
                            return [`${value} kg`, "体重"];
                        }}
                        labelFormatter={(label) => `日付: ${label}`}
                    />

                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
