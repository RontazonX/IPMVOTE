"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Candidate = {
  id: string;
  name: string;
  order_number: number;
  asal_pimpinan: string;
  photo_url?: string;
};

export default function KandidatSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionName, setElectionName] = useState("");
  const [electionLevel, setElectionLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      const supabase = createClient();
      
      // 1. Fetch Election by slug
      const { data: election, error: electionError } = await supabase
        .from("elections")
        .select("id, name, level")
        .eq("slug", slug)
        .single();
        
      if (electionError || !election) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setElectionName(election.name);
      setElectionLevel(election.level);

      // 2. Fetch Candidates for this election
      const { data: candData } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", election.id)
        .order("order_number", { ascending: true });

      if (candData) {
        setCandidates(candData);
      }
      
      setLoading(false);
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl font-medium text-slate-500 animate-pulse">Memuat Data Formatur...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Event Tidak Ditemukan</h1>
        <p className="text-slate-600 mb-8">URL daftar formatur yang Anda tuju tidak ada atau salah.</p>
        <Link href="/" className="px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors font-medium">
            <ArrowLeft size={20} />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
            IPM<span className="text-amber-500">Vote</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Daftar Calon Formatur</h1>
          <p className="text-slate-500 max-w-2xl mx-auto mb-2">Kenali lebih dekat calon-calon formatur terbaik pilihan Anda.</p>
          <span className="inline-block bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-bold text-sm">
            {electionName} ({electionLevel})
          </span>
        </div>

        {candidates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id}
                className="group relative bg-white rounded-3xl border-2 border-transparent transition-all duration-300 flex flex-col p-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-100"
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 relative mb-3 sm:mb-4">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <span className="text-xs font-medium text-slate-400">Tanpa Foto</span>
                    </div>
                  )}

                  {/* Order Number Badge */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-md text-slate-900 font-black text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-sm border border-white/50 z-20">
                    #{candidate.order_number}
                  </div>
                </div>

                {/* Text Info */}
                <div className="px-1.5 pb-1 sm:pb-2">
                  <h3 className="font-bold text-sm sm:text-base leading-snug mb-1 sm:mb-1.5 text-slate-900 group-hover:text-amber-600 transition-colors">
                    {candidate.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500">
                    <Building size={14} className="shrink-0 mt-0.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    <span className="line-clamp-2 leading-tight">{candidate.asal_pimpinan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <ImageIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Kandidat</h3>
            <p className="text-slate-500">Kandidat untuk pemilihan ini belum ditambahkan oleh panitia.</p>
          </div>
        )}
      </main>
    </div>
  );
}
