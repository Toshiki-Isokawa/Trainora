"use client";

import { useEffect, useState } from "react";
import HomeHeader from "./HomeHeader";
import HomeSummaryCards from "./HomeSummaryCards";
import WeightSection from "./WeightSection";
import WeightRecordCard from "./WeightRecordCard";

export default function HomeLoggedIn({ session }: any) {
  const userId = session.user.userId;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weightHistory, setWeightHistory] = useState([]);

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
      <WeightSection weightHistory={weightHistory} />
      <WeightRecordCard userId={userId} />
    </main>
  );
}
