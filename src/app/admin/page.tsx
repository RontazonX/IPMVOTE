"use client";

import { useEffect, useState } from "react";
import { getPublishResultStatus, togglePublishResultStatus } from "@/app/actions/settings";
import { Users, UserCheck, Inbox, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";

type Stats = {
  totalVoters: number;
  votedVoters: number;
  totalCandidates: number;
};

type Leaderboard = {
  candidateId: string;
  name: string;
  no: number;
  votes: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalVoters: 0, votedVoters: 0, totalCandidates: 0 });
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { count: totalVoters } = await supabase.from("voters").select("*", { count: "exact", head: true });
      const { count: votedVoters } = await supabase.from("voters").select("*", { count: "exact", head: true }).eq("is_voted", true);
      const { count: totalCandidates } = await supabase.from("candidates").select("*", { count: "exact", head: true });
      
      setStats({
        totalVoters: totalVoters || 0,
        votedVoters: votedVoters || 0,
        totalCandidates: totalCandidates || 0,
      });
      
      const { data: candidates } = await supabase.from("candidates").select("id, name, order_number, photo_url");
      const { data: votes } = await supabase.from("votes").select("candidate_id");

      if (candidates && votes) {
        const voteCounts: Record<string, number> = {};
        votes.forEach(v => {
          voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
        });

        const board: Leaderboard[] = candidates.map(c => ({
          candidateId: c.id,
          name: c.name,
          no: c.order_number,
          votes: voteCounts[c.id] || 0
        }));

        board.sort((a, b) => {
          if (b.votes === a.votes) return a.no - b.no;
          return b.votes - a.votes;
        });

        setLeaderboard(board);
      }
      
      const pubStatus = await getPublishResultStatus();
      setIsPublished(pubStatus);
      
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleTogglePublish = async () => {
    setToggling(true);
    const res = await togglePublishResultStatus();
    setToggling(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      setIsPublished(res.status!);
      alert(res.status ? "Hasil berhasil dipublikasikan!" : "Hasil disembunyikan dari publik.");
    }
  };

  const barChartCategories = leaderboard.slice(0, 9).map(c => c.name);
  const barChartData = leaderboard.slice(0, 9).map(c => c.votes);
  
  const notVoted = stats.totalVoters - stats.votedVoters;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Pantau hasil pemilihan formatur secara langsung (Real-time).</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleTogglePublish}
            disabled={toggling}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70 ${isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
          >
            {toggling ? (
              <span className="animate-pulse">Loading...</span>
            ) : isPublished ? (
              <><Eye size={16} /> Hasil Dipublikasi (Klik Batal)</>
            ) : (
              <><EyeOff size={16} /> Sembunyikan (Klik Publikasi)</>
            )}
          </button>
          <a href="/admin/candidates" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Tambah Kandidat
          </a>
          <a href="/admin/voters" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Buat Token
          </a>
        </div>
      </div>

      {/* Metrics Cards - TailAdmin Style */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-slate-100">
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-800">
                {loading ? "..." : stats.totalVoters}
              </h4>
              <span className="text-sm font-medium text-slate-500">Total Pemilih Terdaftar</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-slate-100">
            <UserCheck className="text-emerald-500" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-800">
                {loading ? "..." : stats.votedVoters}
              </h4>
              <span className="text-sm font-medium text-slate-500">Pemilih Sudah Memilih</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-slate-100">
            <Inbox className="text-amber-500" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-800">
                {loading ? "..." : stats.totalCandidates}
              </h4>
              <span className="text-sm font-medium text-slate-500">Total Kandidat Formatur</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts - TailAdmin Style */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {!loading && (
          <>
            <BarChart categories={barChartCategories} data={barChartData} />
            <DonutChart voted={stats.votedVoters} notVoted={notVoted} />
          </>
        )}
      </div>

      {/* Leaderboard Detail (Classic Data Table) */}
      <div className="col-span-12 rounded-2xl border border-slate-200 bg-white shadow-sm mt-8">
        <div className="border-b border-slate-200 px-6 py-4">
          <h4 className="text-xl font-bold text-slate-800">Perolehan Suara Lengkap (Ranking Formatur)</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="py-4 px-4 font-medium text-slate-700">Ranking</th>
                  <th className="py-4 px-4 font-medium text-slate-700">No. Urut</th>
                  <th className="py-4 px-4 font-medium text-slate-700">Nama Lengkap</th>
                  <th className="py-4 px-4 font-medium text-slate-700 text-right">Jumlah Suara</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">Memuat data...</td>
                  </tr>
                ) : (
                  leaderboard.map((candidate, index) => (
                    <tr key={candidate.candidateId} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-4 px-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          index < 9 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{candidate.no}</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{candidate.name}</td>
                      <td className="py-4 px-4 font-bold text-blue-600 text-right">{candidate.votes} Suara</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
