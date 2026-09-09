"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import Link from "next/link";

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

export default function ResultPage() {
  const { slug } = useParams() as { slug: string };
  const [isPublished, setIsPublished] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalVoters: 0, votedVoters: 0, totalCandidates: 0 });
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [electionName, setElectionName] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      const supabase = createClient();
      
      // 1. Fetch Election by slug
      const { data: election, error: electionError } = await supabase
        .from("elections")
        .select("id, name, is_result_published")
        .eq("slug", slug)
        .single();
        
      if (electionError || !election) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setElectionName(election.name);
      setIsPublished(election.is_result_published);

      if (!election.is_result_published) {
        setLoading(false);
        return;
      }

      const eId = election.id;

      // 2. Fetch results if published
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
        votes.forEach((v: any) => {
          voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
        });

        const board: Leaderboard[] = candidates.map((c: any) => ({
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

      setLoading(false);
    }

    fetchData();

    // Auto refresh every 10 seconds if not notFound
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Event Tidak Ditemukan</h1>
        <p className="text-slate-600 mb-8">URL hasil pemilihan yang Anda tuju tidak ada atau salah.</p>
        <Link href="/" className="px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">Kembali ke Beranda</Link>
      </div>
    );
  }

  // WAITING SCREEN (Not Published)
  if (!isPublished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 md:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-2xl w-full">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Lock size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            Hasil Pemilihan Masih Dikunci
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            Panitia Pemilihan <b>{electionName}</b> belum mempublikasikan hasil. Silakan tunggu aba-aba dari panitia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              Cek Lagi
            </button>
            <Link href="/" className="px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RESULT DASHBOARD (Published)
  const barChartCategories = leaderboard.slice(0, 9).map(c => c.name);
  const barChartData = leaderboard.slice(0, 9).map(c => c.votes);
  const notVoted = stats.totalVoters - stats.votedVoters;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar for Result */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-900">
            IPM<span className="text-amber-500">Vote</span> <span className="font-light text-slate-400">| Live Result</span>
          </div>
          <Link href="/" className="text-slate-500 hover:text-amber-500 font-medium transition-colors">
            Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-6">
            9 Formatur Terpilih
          </h1>
          <p className="text-xl text-slate-500 mt-4">{electionName}</p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboard.slice(0, 9).map((l, index) => (
              <div key={l.candidateId} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:border-amber-400 transition-colors">
                <div className="absolute -right-6 -bottom-6 text-9xl font-black text-slate-50 group-hover:text-amber-50 transition-colors z-0 select-none">
                  {index + 1}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl z-10">
                  #{index + 1}
                </div>
                <div className="z-10">
                  <h3 className="font-bold text-xl text-slate-900 line-clamp-1">{l.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-2">No. Urut {l.no}</p>
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-lg w-fit text-sm">
                    {l.votes} Suara
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          <BarChart categories={barChartCategories} data={barChartData} />
          
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            <div className="flex-1 [&>div]:h-full [&>div]:xl:col-span-12 [&>div]:col-span-12">
              <DonutChart voted={stats.votedVoters} notVoted={notVoted} />
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center text-center">
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1">Total Pemilih</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalVoters}</p>
              </div>
              <div className="w-px h-12 bg-slate-200 mx-4"></div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1">Suara Masuk</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.votedVoters}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FULL LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900">Semua Perolehan Suara</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium text-sm border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Peringkat</th>
                  <th className="px-6 py-4">No. Urut</th>
                  <th className="px-6 py-4">Nama Kandidat</th>
                  <th className="px-6 py-4 text-right">Total Suara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item, i) => (
                  <tr key={item.candidateId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">#{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded font-medium text-xs">{item.no}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-lg font-bold text-sm">
                        {item.votes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
