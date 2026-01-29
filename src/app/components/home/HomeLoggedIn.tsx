"use client";

import { useEffect, useState } from "react";
import HomeHeader from "./HomeHeader";
import HomeSummaryCards from "./HomeSummaryCards";
import WeightSection from "./WeightSection";
import WeightRecordCard from "./WeightRecordCard";
import WorkoutCalendar from "../workout/WorkoutCalendar";

type TabType = "weight" | "workout";

export default function HomeLoggedIn({ session }: any) {
  const userId = session.user.userId;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weightHistory, setWeightHistory] = useState([]);
  const [activeTab, setActiveTab] = useState<TabType>("weight");


  useEffect(() => {
    const fetchAll = async () => {
      const profileRes = await fetch(`/api/user/profile?userId=${userId}`);
      const weightRes = await fetch(`/api/weight/receive?userId=${userId}`);

      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }
      if (weightRes.ok) {
        const w = await weightRes.json();
        setWeightHistory(w.items);
      }
      setLoading(false);
    };

    fetchAll();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <HomeHeader profile={profile} />
      <HomeSummaryCards profile={profile} />
      
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("weight")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition
            ${
              activeTab === "weight"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500"
            }`}
        >
          体重
        </button>
        <button
          onClick={() => setActiveTab("workout")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition
            ${
              activeTab === "workout"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500"
            }`}
        >
          トレーニング
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "weight" && (
        <>
          <WeightSection weightHistory={weightHistory} />
          <WeightRecordCard userId={userId} />
        </>
      )}

      {activeTab === "workout" && (
        <WorkoutCalendar userId={userId} />
      )}
    </main>
  );
}
