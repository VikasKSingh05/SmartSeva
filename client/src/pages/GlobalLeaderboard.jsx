import React, { useEffect, useState } from "react";
import { Leaderboard } from "../components";
import { Trophy } from "lucide-react";
import { useStateContext } from "../context";

const GlobalLeaderboard = () => {
  const { campaigns, getDonations, contract } = useStateContext();
  const [topDonors, setTopDonors] = useState([]);
  const [topCampaignTitle, setTopCampaignTitle] = useState("");
  const [topCampaignDonors, setTopCampaignDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!contract || !campaigns || campaigns.length === 0) return;
      setLoading(true);
      try {
        // 1) Global top donors aggregation
        const totals = new Map(); // address -> total ETH string sum
        for (const c of campaigns) {
          const dons = await getDonations(c.id);
          for (const d of dons) {
            const prev = Number(totals.get(d.donator) || 0);
            totals.set(d.donator, prev + Number(d.donation || 0));
          }
        }
        const donorsArr = Array.from(totals.entries())
          .map(([address, total]) => ({ address, amount: Number(total).toFixed(4) }))
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 10);
        setTopDonors(donorsArr);

        // 2) Find most generous campaign by amountCollected
        const best = [...campaigns].sort((a, b) => Number(b.amountCollected || 0) - Number(a.amountCollected || 0))[0];
        if (best) {
          setTopCampaignTitle(best.title);
          const dons = await getDonations(best.id);
          const donorsForBest = dons
            .map((d) => ({ address: d.donator, amount: d.donation }))
            .sort((a, b) => Number(b.amount) - Number(a.amount));
          setTopCampaignDonors(donorsForBest);
        } else {
          setTopCampaignTitle("");
          setTopCampaignDonors([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contract, campaigns]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center px-2 py-4">
      <section className="w-full max-w-2xl mx-auto bg-[#181824]/90 dark:bg-[#232336]/95 rounded-2xl glass-card shadow p-8 my-6 text-center flex flex-col items-center">
        <Trophy className="w-12 h-12 text-[#FFD700] mb-3" />
        <h1 className="text-3xl font-extrabold text-[#6F01Ec] mb-2">Global Donor Leaderboard</h1>
        <p className="text-md md:text-lg text-gray-300 mb-1">Celebrating the most generous contributors in SmartSeva.</p>
      </section>
      <Leaderboard global donors={topDonors} isLoading={loading} />
      <section className="w-full max-w-2xl mx-auto bg-[#191927]/80 dark:bg-[#212132]/95 rounded-2xl glass-card shadow p-8 my-6 text-center flex flex-col items-center">
        <h2 className="text-2xl font-extrabold mb-3 text-[#03dac5]">Most Generous Campaign</h2>
        <div className="font-bold text-[#f7b731] text-xl mb-2">{topCampaignTitle || "-"}</div>
        <Leaderboard global={false} donors={topCampaignDonors} isLoading={loading} />
      </section>
    </div>
  );
};

export default GlobalLeaderboard;
