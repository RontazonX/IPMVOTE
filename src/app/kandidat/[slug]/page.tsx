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
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden flex flex-col hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-full aspect-[3/4] sm:aspect-[4/5] bg-slate-100 relative overflow-hidden">
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-lg z-20 border-2 border-white">
                    {candidate.order_number}
                  </div>
                  
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <ImageIcon size={32} className="mb-2 opacity-20 sm:w-12 sm:h-12" />
                      <span className="text-xs sm:text-sm font-medium">Tanpa Foto</span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between bg-white relative z-10 border-t border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm sm:text-lg mb-1.5 leading-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                      {candidate.name}
                    </h3>
                    <div className="flex items-start sm:items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit">
                      <Building size={14} className="text-amber-500 flex-shrink-0" />
                      <span className="line-clamp-1">{candidate.asal_pimpinan}</span>
                    </div>
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
