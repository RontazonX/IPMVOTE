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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              9
            </div>
            <h1 className="font-bold text-lg hidden sm:block text-slate-800">Bilik Suara Formatur</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <span className={`${selectedIds.length === 9 ? 'text-emerald-600' : 'text-blue-600'}`}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedIds.includes(candidate.id);
            
            return (
              <div 
                key={candidate.id}
                onClick={() => toggleSelection(candidate.id)}
                className={`
                  relative bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                  ${isSelected 
                    ? 'border-blue-600 shadow-lg shadow-blue-600/20 bg-blue-50/30' 
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }
                `}
              >
                {/* Checkbox indicator */}
                <div className={`
                  absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10
                  ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white/80'}
                `}>
                  {isSelected && <CheckCircle2 size={16} />}
                </div>

                {/* Candidate Photo Header */}
                <div className="h-40 bg-slate-100 relative">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <span className="text-sm">Tidak ada foto</span>
                    </div>
                  )}
                  {/* Order Number Badge */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {candidate.order_number}
                  </div>
                </div>

                <div className="p-5 relative">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 pr-8">{candidate.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                    <Building size={14} className="text-slate-400" />
                    <span>{candidate.asal_pimpinan}</span>
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
              <span>Anda masih perlu memilih <strong className="text-blue-600">{9 - selectedIds.length}</strong> kandidat lagi.</span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length !== 9 || submitting}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${selectedIds.length === 9 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transform hover:-translate-y-0.5' 
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
