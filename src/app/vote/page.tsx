"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Building, Image as ImageIcon } from "lucide-react";
import { submitVote, getVoterElectionSettings } from "../actions/vote";
import { getCandidates } from "../actions/candidates";

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
  const [maxSelections, setMaxSelections] = useState(9);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const settings = await getVoterElectionSettings();
      if (settings && !settings.error) {
        setMaxSelections(settings.maxSelectedFormaturs || 9);
      }
      
      const res = await getCandidates();
      if (res.data) {
        setCandidates(res.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(cId => cId !== id);
      if (prev.length >= maxSelections) return prev; // Max check
      return [...prev, id];
    });
  };

  const handleReview = () => {
    if (selectedIds.length !== maxSelections) {
      toast.error(`Anda baru memilih ${selectedIds.length} dari ${maxSelections} formatur yang wajib dipilih!`);
      return;
    }
    setShowReviewModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitVote(selectedIds);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
      setShowReviewModal(false);
    } else {
      toast.success("Suara berhasil dikirim! Terima kasih atas partisipasi Anda.");
      router.push("/");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xl font-medium text-slate-500 animate-pulse">Menyiapkan Bilik Suara...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {maxSelections}
            </div>
            <h1 className="font-bold text-lg hidden sm:block text-slate-900">Bilik Suara Formatur</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <span className={`${selectedIds.length === maxSelections ? 'text-emerald-600' : 'text-amber-600'}`}>
                {selectedIds.length} / {maxSelections}
              </span>
              <span className="text-slate-500 hidden sm:inline">Terpilih</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pilih {maxSelections} Formatur Terbaik</h2>
          <p className="text-slate-500">Klik pada kartu kandidat untuk memilih. Anda wajib memilih tepat {maxSelections} orang formatur.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedIds.includes(candidate.id);
            
            return (
              <div 
                key={candidate.id}
                onClick={() => toggleSelection(candidate.id)}
                className={`
                  group relative bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col p-2.5
                  ${isSelected 
                    ? 'border-amber-500 bg-amber-50/30 shadow-[0_8px_30px_rgba(245,158,11,0.15)] -translate-y-1' 
                    : 'border-transparent shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-100'
                  }
                `}
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

                  {/* Checkbox indicator */}
                  <div className={`
                    absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all z-20 backdrop-blur-md
                    ${isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-110' : 'bg-white/80 border-slate-200 text-transparent shadow-sm group-hover:border-amber-300'}
                  `}>
                    <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-30 text-amber-500"}`} />
                  </div>
                </div>

                {/* Text Info */}
                <div className="px-1.5 pb-1 sm:pb-2">
                  <h3 className={`font-bold text-sm sm:text-base leading-snug mb-1 sm:mb-1.5 transition-colors ${isSelected ? 'text-amber-700' : 'text-slate-900'}`}>
                    {candidate.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500">
                    <Building size={14} className={`shrink-0 mt-0.5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="line-clamp-2 leading-tight">{candidate.asal_pimpinan}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-600">
            {selectedIds.length === maxSelections ? (
              <span className="text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={18} /> Pemilihan selesai, siap dikirim!
              </span>
            ) : (
              <span>Anda masih perlu memilih <strong className="text-amber-600">{maxSelections - selectedIds.length}</strong> kandidat lagi.</span>
            )}
          </div>
          
          <button
            onClick={handleReview}
            disabled={selectedIds.length !== maxSelections}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${selectedIds.length === maxSelections 
                ? 'bg-amber-500 hover:bg-amber-600 text-white transform hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Review & Kirim Suara
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Review Pilihan Formatur</h3>
                <p className="text-sm text-slate-500">Pastikan pilihan Anda sudah benar sebelum dikirim permanen.</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates
                  .filter(c => selectedIds.includes(c.id))
                  .sort((a, b) => a.order_number - b.order_number)
                  .map(candidate => (
                    <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="w-14 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative">
                        {candidate.photo_url ? (
                          <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
                          {candidate.order_number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{candidate.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building size={10} className="shrink-0" />
                          <span className="truncate">{candidate.asal_pimpinan}</span>
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 sm:gap-4 flex-col sm:flex-row">
              <button 
                onClick={() => setShowReviewModal(false)}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal, Ubah Pilihan
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
              >
                {submitting ? "Memproses..." : "Ya, Kirim Suara Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
