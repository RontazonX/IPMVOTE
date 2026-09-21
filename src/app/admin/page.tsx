"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { togglePublishResultStatus, resetElection, getAdminElectionInfo, getSuperadminDashboardStats } from "@/app/actions/elections";
import { enterElection } from "@/app/actions/adminAuth";
import { Eye, EyeOff, Users, CheckCircle, List } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Evoting Custom Analytics Components
import { EvotingMetrics } from "@/components/analytics/EvotingMetrics";
import { EvotingLeaderboard } from "@/components/analytics/EvotingLeaderboard";
import { GlobalParticipationChart } from "@/components/analytics/GlobalParticipationChart";

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
  photo_url?: string;
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
        const { data: votes } = await supabase.from("votes").select("candidate_id, created_at").eq("election_id", eId);

        if (candidates && votes) {
          const voteCounts: Record<string, number> = {};
          
          votes.forEach(v => {
            voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
          });

          const board: Leaderboard[] = candidates.map(c => ({
            candidateId: c.id,
            name: c.name,
            no: c.order_number,
            photo_url: c.photo_url,
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
      toast.error(res.error);
    } else {
      setIsPublished(res.status!);
      toast.success(res.status ? "Hasil berhasil dipublikasikan!" : "Hasil disembunyikan dari publik.");
    }
  };

  const handleResetElection = async () => {
    if (!confirm("PERINGATAN: Aksi ini akan menghapus semua suara yang telah masuk dan mereset status pemilih. Apakah Anda yakin?")) return;
    
    setToggling(true);
    const res = await resetElection();
    setToggling(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Pemilihan berhasil di-reset!");
      window.location.reload();
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center text-slate-500">Memuat data analitik...</div>;
  }

  if (isSuperadmin) {
    const totalGlobalVoters = globalStats.reduce((acc, stat) => acc + stat.totalVoters, 0);
    const totalGlobalVoted = globalStats.reduce((acc, stat) => acc + stat.votedVoters, 0);
    const totalGlobalEvents = globalStats.length;

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pusat Pemantauan Superadmin</h1>
            <p className="text-slate-500 mt-1">Pantau seluruh event pemilihan formatur di seluruh wilayah secara langsung.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={`${basePath}/settings`} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
              Pengaturan Sistem
            </a>
            <a href={`${basePath}/elections`} className="px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors shadow-sm">
              + Manajemen Event
            </a>
          </div>
        </div>

        {/* Global Superadmin Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Event Aktif</h3>
              <List className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalGlobalEvents}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Pemilih Global</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalGlobalVoters}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Suara Masuk Global</h3>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">{totalGlobalVoted}</div>
              <div className="text-sm text-emerald-500 font-medium mb-1">
                ({totalGlobalVoters > 0 ? Math.round((totalGlobalVoted / totalGlobalVoters) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Global Analytics Chart */}
        <GlobalParticipationChart data={globalStats} />

        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Daftar Event Pemilihan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {globalStats.map(stat => (
              <div key={stat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1" title={stat.name}>{stat.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${stat.is_result_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {stat.is_result_published ? 'Hasil Publik' : 'Tertutup'}
                  </span>
                  <span className="text-sm text-slate-500">{stat.totalCandidates} Formatur</span>
                </div>
                
                <div className="space-y-4 mb-6 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Partisipasi (Turnout)</span>
                      <span className="font-bold text-slate-900">{stat.votedVoters} / {stat.totalVoters}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${stat.totalVoters > 0 ? (stat.votedVoters / stat.totalVoters) * 100 : 0}%` }}></div>
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors"
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard {electionInfo ? `- ${electionInfo.name}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">Pantau proses pemilihan dan perolehan suara secara real-time.</p>
          {electionInfo && (
            <p className="text-sm mt-2 text-brand-600 font-medium">
              Link Hasil Publik: <a href={`/result/${electionInfo.slug}`} target="_blank" rel="noreferrer" className="underline hover:text-brand-700">/result/{electionInfo.slug}</a>
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
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-70"
          >
            Reset Pemilihan
          </button>
          <a href={`${basePath}/candidates`} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
            + Tambah Kandidat
          </a>
          <a href={`${basePath}/voters`} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            + Buat Token
          </a>
        </div>
      </div>

      {/* Evoting Specific Analytics Components */}
      <EvotingMetrics 
        totalVoters={stats.totalVoters}
        votedVoters={stats.votedVoters}
        totalCandidates={stats.totalCandidates}
      />

      <div className="grid grid-cols-1 gap-6">
        <EvotingLeaderboard data={leaderboard} maxHighlight={13} />
      </div>
    </div>
  );
}
