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
            <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-500">
            体重データがまだありません
            </div>
        );
        }

    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-600">
                    体重の推移
                </h2>
            </div>

            {/* Range selector (horizontal scroll on mobile) */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
                    <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition
                        ${
                        range === r
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                    >
                    {r.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="w-full h-52 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickMargin={8}
                    />

                    <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 11 }}
                        width={36}
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
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                    />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
