"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle2, User, Building, Image as ImageIcon } from "lucide-react";
import { submitVote } from "../actions/vote";
import { createClient } from "@/utils/supabase/client";

type Candidate = {
  id: string;
  name: string;
  order_number: number;
  asal_pimpinan: string;
  photo_url?: string;
};

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCandidates() {
      const supabase = createClient();
      const { data, error } = await supabase.from("candidates").select("*").order("order_number", { ascending: true });
      if (data) {
        setCandidates(data);
      }
      setLoading(false);
    }
    fetchCandidates();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(cId => cId !== id);
      if (prev.length >= 9) return prev; // Max 9
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length !== 9) {
      alert(`Anda baru memilih ${selectedIds.length} dari 9 formatur yang wajib dipilih!`);
      return;
    }

    if (!confirm("Apakah Anda yakin dengan pilihan ini? Suara tidak dapat diubah setelah dikirim.")) return;

    setSubmitting(true);
    const res = await submitVote(selectedIds);
    setSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert("Suara berhasil dikirim! Terima kasih atas partisipasi Anda.");
      router.push("/");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xl font-medium text-slate-500 animate-pulse">Menyiapkan Bilik Suara...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              9
            </div>
            <h1 className="font-bold text-lg hidden sm:block text-slate-800">Bilik Suara Formatur</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <span className={`${selectedIds.length === 9 ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {selectedIds.length} / 9
              </span>
              <span className="text-slate-500 hidden sm:inline">Terpilih</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pilih 9 Formatur Terbaik</h2>
          <p className="text-slate-600">Klik pada kartu kandidat untuk memilih. Anda wajib memilih tepat 9 orang formatur.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedIds.includes(candidate.id);
            
            return (
              <div 
                key={candidate.id}
                onClick={() => toggleSelection(candidate.id)}
                className={`
                  group relative bg-white rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col
                  ${isSelected 
                    ? 'border-yellow-500 shadow-xl shadow-yellow-500/20 bg-yellow-50/30' 
                    : 'border-slate-100 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1'
                  }
                `}
              >
                {/* Checkbox indicator */}
                <div className={`
                  absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all z-20 shadow-sm
                  ${isSelected ? 'bg-yellow-500 border-yellow-500 text-white scale-110' : 'border-white/80 bg-black/20 backdrop-blur-sm text-transparent group-hover:border-yellow-400 group-hover:bg-white/50'}
                `}>
                  <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50 text-yellow-500"}`} />
                </div>

                {/* Order Number Badge */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm z-20 border border-white/20">
                  {candidate.order_number}
                </div>

                {/* Candidate Photo Header */}
                <div className="w-full aspect-[3/4] sm:aspect-[4/5] bg-slate-100 relative overflow-hidden">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <ImageIcon size={32} className="mb-2 sm:mb-3 opacity-20 sm:w-12 sm:h-12" />
                      <span className="text-xs sm:text-sm font-medium">Tanpa Foto</span>
                    </div>
                  )}
                  {/* Gradient overlay at bottom of image for a more premium look */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                </div>

                <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between bg-white relative z-10 -mt-4 sm:-mt-6 rounded-t-2xl sm:rounded-t-3xl pt-4 sm:pt-6">
                  <div>
                    <h3 className={`font-bold text-sm sm:text-lg mb-1 sm:mb-1.5 leading-tight transition-colors ${isSelected ? 'text-yellow-700' : 'text-slate-900 group-hover:text-yellow-600'}`}>{candidate.name}</h3>
                    <div className="flex items-start sm:items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-slate-500">
                      <Building size={12} className="text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0 sm:w-3.5 sm:h-3.5" />
                      <span className="line-clamp-2 sm:truncate leading-tight">{candidate.asal_pimpinan}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-600">
            {selectedIds.length === 9 ? (
              <span className="text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={18} /> Pemilihan selesai, siap dikirim!
              </span>
            ) : (
              <span>Anda masih perlu memilih <strong className="text-yellow-600">{9 - selectedIds.length}</strong> kandidat lagi.</span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length !== 9 || submitting}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${selectedIds.length === 9 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/30 transform hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {submitting ? "Mengirim Suara..." : "Kirim Suara Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
