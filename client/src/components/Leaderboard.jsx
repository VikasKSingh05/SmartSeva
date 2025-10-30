import React from "react";
import { Award, Trophy, ExternalLink } from "lucide-react";

const Leaderboard = ({ global = false, donors = [], isLoading = false }) => (
  <div className="glass-card rounded-2xl shadow-lg bg-[#191927]/80 dark:bg-[#13131a]/95 p-6 mb-8 max-w-xl mx-auto">
    <div className="flex gap-2 items-center mb-4">
      {global ? <Trophy className="text-[#F7B731] w-6 h-6" /> : <Award className="text-sky-400 w-6 h-6" />}
      <h3 className="text-xl font-bold text-[#6F01Ec] dark:text-[#e4e4e7]">{global ? "Top Donors (Global)" : "Top Donors (This Campaign)"}</h3>
    </div>
    {isLoading ? (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded" />
      </div>
    ) : donors.length === 0 ? (
      <div className="text-sm text-gray-400">No donors yet.</div>
    ) : (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#03dac5] dark:text-[#03dac5]">
              <th className="font-semibold">Rank</th>
              <th className="font-semibold">Donor</th>
              <th className="font-semibold">Amount</th>
              <th className="font-semibold">Txn</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, i) => (
              <tr key={`${donor.address}-${i}`} className="hover:bg-[#262647]/70 dark:hover:bg-[#22223b]/80 transition-all text-gray-900 dark:text-[#e4e4e7]">
                <td className="py-2 font-semibold text-[#FFD700]">#{i + 1}</td>
                <td className="py-2 text-[#03dac5] font-mono flex items-center gap-1">
                  {donor.name || donor.address}
                </td>
                <td className="py-2 font-semibold">{donor.amount} ETH</td>
                <td className="py-2">
                  {donor.tx?.startsWith?.("0x") ? (
                    <a href={`https://sepolia.etherscan.io/tx/${donor.tx}`} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center text-[#6F01Ec] underline">View<ExternalLink className="w-3 h-3 ml-1" /></a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default Leaderboard;
