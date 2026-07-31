"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { getCandidates, addCandidate, deleteCandidate } from "@/app/actions/candidates";

type Candidate = {
  id: string;
  name: string;
  order_number: number;
  asal_pimpinan: string;
  photo_url?: string;
};

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function fetchCandidates() {
    const { data } = await getCandidates();
    if (data) setCandidates(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await addCandidate(formData);
    setSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      setShowAddModal(false);
      fetchCandidates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kandidat ini?")) return;
    const res = await deleteCandidate(id);
    if (res.error) {
      alert(res.error);
    } else {
      fetchCandidates();
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Modal Tambah Kandidat */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Tambah Kandidat</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24">
                  <label className="block text-sm font-medium text-slate-700 mb-1">No. Urut</label>
                  <input type="number" name="no" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asal Pimpinan (Ranting/Cabang)</label>
                <input type="text" name="asal_pimpinan" placeholder="Contoh: PR IPM SMA Muh 3" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pass Foto</label>
                <input type="file" name="photo" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              
              <button disabled={submitting} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-70">
                {submitting ? "Menyimpan..." : "Simpan Kandidat"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Kandidat Formatur</h1>
          <p className="text-slate-500 mt-1">Kelola data calon formatur PC IPM Wirobrajan.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Kandidat
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="px-6 py-4 w-24">No. Urut</th>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Asal Pimpinan</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Belum ada data kandidat.</td></tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 text-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mx-auto">
                        {candidate.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.photo_url ? (
                        <img src={candidate.photo_url} alt={candidate.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{candidate.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{candidate.asal_pimpinan}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(candidate.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
