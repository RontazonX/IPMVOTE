"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { X, CheckSquare, Edit3 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getAdminRole, getVoterCurrentVotes, manageVoterVotes } from "@/app/actions/voters";
import { getAllElections } from "@/app/actions/elections";

type Voter = {
  id: string;
  name: string;
  token: string;
  is_voted: boolean;
  election_id: string;
};

export default function PrivatePage() {
  const [role, setRole] = useState("admin");
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  
  const [maxFormaturs, setMaxFormaturs] = useState(9);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  
  const [showVoteModal, setShowVoteModal] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initData() {
      const r = await getAdminRole();
      setRole(r);
      if (r === "superadmin") {
        const res = await getAllElections();
        if (res.elections) {
          setElections(res.elections);
        }
      }
      setLoading(false);
    }
    initData();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      const el = elections.find(e => e.id === selectedElection);
      if (el) {
        setMaxFormaturs(el.max_selected_formaturs || 9);
      }
      fetchDataForElection(selectedElection);
    }
  }, [selectedElection]);

  async function fetchDataForElection(electionId: string) {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch voters
    const { data: votersData } = await supabase
      .from("voters")
      .select("*")
      .eq("election_id", electionId)
      .order("created_at", { ascending: false });
      
    // Fetch votes (to cross check is_voted)
    const { data: votesData } = await supabase
      .from("votes")
      .select("voter_id")
      .eq("election_id", electionId);
      
    if (votersData) {
      const votedIds = new Set(votesData?.map(v => v.voter_id) || []);
      const updatedVoters = votersData.map(voter => ({
        ...voter,
        is_voted: voter.is_voted || votedIds.has(voter.id)
      }));
      setVoters(updatedVoters);
    }
    
    // Fetch candidates
    const { data: candData } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId)
      .order("order_number", { ascending: true });
      
    if (candData) {
      setCandidates(candData);
    }
    
    setLoading(false);
  }

  const handleManageVote = async (voterId: string) => {
    const res = await getVoterCurrentVotes(voterId);
    if (res.candidateIds) {
      setSelectedCandidates(res.candidateIds);
    } else {
      setSelectedCandidates([]);
    }
    setShowVoteModal(voterId);
  };

  const handleVoteToggle = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) return prev.filter(id => id !== candidateId);
      if (prev.length >= maxFormaturs) {
        toast.error(`Maksimal memilih ${maxFormaturs} formatur`);
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const handleSubmitVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVoteModal) return;
    
    if (selectedCandidates.length !== maxFormaturs) {
      toast.error(`Anda harus memilih tepat ${maxFormaturs} formatur.`);
      return;
    }

    setSubmitting(true);
    const res = await manageVoterVotes(showVoteModal, selectedCandidates);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Suara berhasil disimpan!");
      setShowVoteModal(null);
      fetchDataForElection(selectedElection);
    }
  };

  if (loading && !voters.length && !elections.length) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  if (role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-slate-500">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative max-w-5xl mx-auto mt-10">
      {/* Vote Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Kelola Suara Pemilih</h3>
              <button onClick={() => setShowVoteModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4 shrink-0 p-4 bg-blue-50 text-blue-800 rounded-xl">
              <p className="font-semibold">Informasi:</p>
              <p className="text-sm">Pilih {maxFormaturs} formatur untuk pemilih ini. Anda telah memilih {selectedCandidates.length}/{maxFormaturs}.</p>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates.map((candidate) => (
                  <label 
                    key={candidate.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCandidates.includes(candidate.id) ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleVoteToggle(candidate.id)}
                    />
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${selectedCandidates.includes(candidate.id) ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                      {selectedCandidates.includes(candidate.id) && <CheckSquare size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{candidate.order_number}. {candidate.name}</p>
                      <p className="text-xs text-slate-500">{candidate.asal_pimpinan}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 mt-auto shrink-0">
              <button type="button" onClick={() => setShowVoteModal(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                Batal
              </button>
              <button 
                onClick={handleSubmitVotes}
                disabled={submitting || selectedCandidates.length !== maxFormaturs} 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg py-2.5 transition-all shadow-lg shadow-amber-600/30 disabled:opacity-70 disabled:shadow-none"
              >
                {submitting ? "Menyimpan..." : "Simpan Suara"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Private Control</h1>
        <p className="text-slate-500 mt-1">Sistem manajemen suara (Superadmin Only).</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Event Pemilihan</label>
          <select 
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          >
            <option value="">-- Pilih Event --</option>
            {elections.map((el) => (
              <option key={el.id} value={el.id}>{el.name} ({el.level})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedElection && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            <h2 className="text-xl font-bold text-slate-800">Daftar Pemilih</h2>
            <input 
              type="text"
              placeholder="Cari Token / Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                    <th className="px-6 py-4">Nama Pemilih</th>
                    <th className="px-6 py-4">Token Akses</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Memuat data...</td></tr>
                  ) : filteredVoters.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Data tidak ditemukan.</td></tr>
                  ) : (
                    filteredVoters.map((voter) => (
                      <tr key={voter.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{voter.name}</td>
                        <td className="px-6 py-4">
                          <code className="bg-slate-100 text-amber-600 px-2 py-1 rounded font-mono text-sm border border-slate-200">
                            {voter.token}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {voter.is_voted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Sudah Memilih
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Belum Memilih
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleManageVote(voter.id)}
                              className="px-3 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors font-medium flex items-center gap-2" 
                            >
                              <Edit3 size={14} />
                              {voter.is_voted ? "Ubah" : "Pilihkan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
