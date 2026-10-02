"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Election = {
  id: string;
  name: string;
  level: string;
};

type Candidate = {
  id: string;
  name: string;
  order_number: number;
  asal_pimpinan: string;
  photo_url?: string;
  election_id: string;
};

export default function KandidatPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: elData } = await supabase
        .from("elections")
        .select("id, name, level")
        .order("created_at", { ascending: false });
        
      if (elData && elData.length > 0) {
        setElections(elData);
        setSelectedElection(elData[0].id);
      }

      const { data: candData } = await supabase
        .from("candidates")
        .select("*")
        .order("order_number", { ascending: true });

      if (candData) {
        setCandidates(candData);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl font-medium text-slate-500 animate-pulse">Memuat Data Formatur...</p>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(c => c.election_id === selectedElection);

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
          <p className="text-slate-500 max-w-2xl mx-auto">Kenali lebih dekat calon-calon formatur terbaik pilihan Anda. Cek asal pimpinan dan profil mereka sebelum menentukan pilihan di bilik suara.</p>
        </div>

        {elections.length > 0 ? (
          <>
            <div className="max-w-md mx-auto mb-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Pilih Event Pemilihan</label>
              <select 
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all font-medium text-slate-800 appearance-none text-center shadow-sm"
              >
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>{el.name} ({el.level})</option>
                ))}
              </select>
            </div>

            {filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredCandidates.map((candidate) => (
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
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Event</h3>
            <p className="text-slate-500">Sistem belum memiliki event pemilihan yang aktif.</p>
          </div>
        )}
      </main>
    </div>
  );
}
