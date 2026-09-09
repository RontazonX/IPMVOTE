"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { togglePublishResultStatus, resetElection, getAdminElectionInfo, getSuperadminDashboardStats } from "@/app/actions/elections";
import { enterElection } from "@/app/actions/adminAuth";
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
  const [electionInfo, setElectionInfo] = useState<{name: string, slug: string} | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [globalStats, setGlobalStats] = useState<any[]>([]);
  const pathname = usePathname();
  const basePath = pathname.match(/^\/admin-[^\/]+/)?.[0] || '/admin';

  useEffect(() => {
    async function fetchData() {
      const infoRes = await getAdminElectionInfo();
      if (infoRes.error === "Unauthorized") {
        // Must be superadmin without election_id
        const statsRes = await getSuperadminDashboardStats();
        if (statsRes.stats) {
          setGlobalStats(statsRes.stats);
          setIsSuperadmin(true);
        }
        setLoading(false);
        return;
      }

      if (infoRes.election) {
        setElectionInfo(infoRes.election);
        setIsPublished(infoRes.election.is_result_published);
        
        const supabase = createClient();
        const eId = infoRes.election.id;
        
        const { count: totalVoters } = await supabase.from("voters").select("*", { count: "exact", head: true }).eq("election_id", eId);
        const { count: votedVoters } = await supabase.from("voters").select("*", { count: "exact", head: true }).eq("is_voted", true).eq("election_id", eId);
        const { count: totalCandidates } = await supabase.from("candidates").select("*", { count: "exact", head: true }).eq("election_id", eId);
        
        setStats({
          totalVoters: totalVoters || 0,
          votedVoters: votedVoters || 0,
          totalCandidates: totalCandidates || 0,
        });
        
        const { data: candidates } = await supabase.from("candidates").select("id, name, order_number, photo_url").eq("election_id", eId);
        const { data: votes } = await supabase.from("votes").select("candidate_id").eq("election_id", eId);

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
      }
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

  const handleResetElection = async () => {
    if (!confirm("PERINGATAN: Aksi ini akan menghapus semua suara yang telah masuk dan mereset status pemilih. Apakah Anda yakin?")) return;
    
    setToggling(true);
    const res = await resetElection();
    setToggling(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      alert("Pemilihan berhasil di-reset!");
      window.location.reload();
    }
  };

  if (loading) {
    return <div>Memuat...</div>;
  }

  if (isSuperadmin) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pusat Pemantauan Superadmin</h1>
            <p className="text-slate-500 mt-1">Pantau seluruh event musyawarah yang sedang berlangsung.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={`${basePath}/settings`} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
              Pengaturan Tampilan
            </a>
            <a href={`${basePath}/elections`} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
              + Manajemen Event
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {globalStats.map(stat => (
            <div key={stat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{stat.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${stat.is_result_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {stat.is_result_published ? 'Hasil Dipublikasi' : 'Ditutup'}
                </span>
                <span className="text-sm text-slate-500">{stat.totalCandidates} Kandidat</span>
              </div>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Partisipasi Pemilih</span>
                    <span className="font-medium text-slate-900">{stat.votedVoters} / {stat.totalVoters}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${stat.totalVoters > 0 ? (stat.votedVoters / stat.totalVoters) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  setToggling(true);
                  const res = await enterElection(stat.id, stat.slug);
                  if (res?.success) window.location.href = res.redirectUrl;
                  else setToggling(false);
                }}
                disabled={toggling}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {toggling ? 'Memuat...' : 'Kelola & Pantau Detail'}
              </button>
            </div>
          ))}
          {globalStats.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              Belum ada event pemilihan yang dibuat.
            </div>
          )}
        </div>
      </div>
    );
  }

  const barChartCategories = leaderboard.slice(0, 9).map(c => c.name);
  const barChartData = leaderboard.slice(0, 9).map(c => c.votes);
  const notVoted = stats.totalVoters - stats.votedVoters;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard {electionInfo ? `- ${electionInfo.name}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">Pantau hasil pemilihan formatur secara langsung (Real-time).</p>
          {electionInfo && (
            <p className="text-sm mt-2 text-amber-600 font-medium">
              Link Hasil Publik: <a href={`/result/${electionInfo.slug}`} target="_blank" rel="noreferrer" className="underline">/result/{electionInfo.slug}</a>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleTogglePublish}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70 ${isPublished ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {toggling ? (
              <span className="animate-pulse">Loading...</span>
            ) : isPublished ? (
              <><Eye size={16} /> Hasil Dipublikasi (Klik Batal)</>
            ) : (
              <><EyeOff size={16} /> Sembunyikan (Klik Publikasi)</>
            )}
          </button>
          <button 
            onClick={handleResetElection}
            disabled={toggling}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-70"
          >
            Reset Pemilihan
          </button>
          <a href={`${basePath}/candidates`} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Tambah Kandidat
          </a>
          <a href={`${basePath}/voters`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Buat Token
          </a>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
            <Users className="text-amber-500" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-900">
                {stats.totalVoters}
              </h4>
              <span className="text-sm font-medium text-slate-500">Total Pemilih Terdaftar</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
            <UserCheck className="text-emerald-500" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-900">
                {stats.votedVoters}
              </h4>
              <span className="text-sm font-medium text-slate-500">Pemilih Sudah Memilih</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white py-6 px-7.5 shadow-sm">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
            <Inbox className="text-slate-500" size={24} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-slate-900">
                {stats.totalCandidates}
              </h4>
              <span className="text-sm font-medium text-slate-500">Total Kandidat Formatur</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <BarChart categories={barChartCategories} data={barChartData} />
        <DonutChart voted={stats.votedVoters} notVoted={notVoted} />
      </div>

      {/* Leaderboard Detail */}
      <div className="col-span-12 rounded-2xl border border-slate-200 bg-white shadow-sm mt-8">
        <div className="border-b border-slate-200 px-6 py-4">
          <h4 className="text-xl font-bold text-slate-900">Perolehan Suara Lengkap (Ranking Formatur)</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-200">
                  <th className="py-4 px-4 font-medium text-slate-500 text-sm">Ranking</th>
                  <th className="py-4 px-4 font-medium text-slate-500 text-sm">No. Urut</th>
                  <th className="py-4 px-4 font-medium text-slate-500 text-sm">Nama Lengkap</th>
                  <th className="py-4 px-4 font-medium text-slate-500 text-sm text-right">Jumlah Suara</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">Belum ada kandidat atau suara.</td>
                  </tr>
                ) : (
                  leaderboard.map((candidate, index) => (
                    <tr key={candidate.candidateId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-medium border ${
                          index < 9 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{candidate.no}</td>
                      <td className="py-4 px-4 font-medium text-slate-900">{candidate.name}</td>
                      <td className="py-4 px-4 font-bold text-amber-600 text-right">{candidate.votes} Suara</td>
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
