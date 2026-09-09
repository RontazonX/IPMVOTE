"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/utils/supabase/client";
import { addVoter, deleteVoter, addMultipleVoters, deleteAllVoters } from "@/app/actions/voters";

type Voter = {
  id: string;
  name: string;
  token: string;
  is_voted: boolean;
};

import { usePathname } from "next/navigation";

export default function AdminVoters() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newVoterName, setNewVoterName] = useState("");

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState("10");

  const pathname = usePathname();
  const basePath = pathname.match(/^\/admin-[^\/]+/)?.[0] || '/admin';

  async function fetchVoters(showLoader = true) {
    if (showLoader) setLoading(true);
    const supabase = createClient();
    
    // Ambil data pemilih
    const { data: votersData } = await supabase.from("voters").select("*").order("created_at", { ascending: false });
    
    // Ambil data suara untuk cross-check is_voted (karena update is_voted via RLS gagal)
    const { data: votesData } = await supabase.from("votes").select("voter_id");
    
    if (votersData) {
      const votedIds = new Set(votesData?.map(v => v.voter_id) || []);
      
      const updatedVoters = votersData.map(voter => ({
        ...voter,
        is_voted: voter.is_voted || votedIds.has(voter.id)
      }));
      
      setVoters(updatedVoters);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVoters(false);
  }, []);

  const handleAddRandom = async () => {
    setSubmitting(true);
    const res = await addVoter(); // Tanpa nama, akan otomatis menjadi Peserta WIR-XXXX
    setSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      fetchVoters();
      if (res.token) {
        setShowQR(res.token);
      }
    }
  };

  const handleBulkAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(bulkCount);
    
    if (isNaN(qty) || qty < 1 || qty > 100) {
      alert("Jumlah tidak valid. Masukkan angka antara 1 hingga 100.");
      return;
    }

    setSubmitting(true);
    const res = await addMultipleVoters(qty);
    setSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setShowBulkModal(false);
      setBulkCount("10");
      alert(`Berhasil membuat ${res.count} token!`);
      fetchVoters();
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await addVoter(newVoterName);
    setSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      setNewVoterName("");
      setShowAddModal(false);
      fetchVoters();
      if (res.token) {
        setShowQR(res.token);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pemilih ini beserta tokennya?")) return;
    const res = await deleteVoter(id);
    if (res.error) {
      alert(res.error);
    } else {
      fetchVoters();
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("PERINGATAN: Aksi ini akan menghapus semua pemilih dan QR Code mereka secara permanen! Apakah Anda yakin?")) return;
    setSubmitting(true);
    const res = await deleteAllVoters();
    setSubmitting(false);
    if (res.error) {
      alert(res.error);
    } else {
      alert("Semua data pemilih berhasil dihapus!");
      fetchVoters();
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowQR(null)}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-100 transition-all" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Scan QR untuk Memilih</h3>
            <div className="bg-white p-4 rounded-xl border-4 border-blue-600 inline-block mb-4 shadow-lg shadow-blue-600/20">
              <QRCodeSVG value={typeof window !== 'undefined' ? `${window.location.origin}/login?token=${showQR}` : showQR} size={250} level="H" includeMargin={true} />
            </div>
            <p className="text-2xl font-mono font-bold tracking-widest text-blue-600 bg-blue-50 py-2 rounded-lg">{showQR}</p>
            <p className="text-sm text-slate-500 mt-4">Gunakan kamera atau aplikasi scanner pada halaman utama.</p>
            <button 
              onClick={() => setShowQR(null)}
              className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Pemilih Spesifik */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Generate Token (Dengan Nama)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pemilih / Ranting</label>
                <input 
                  type="text" 
                  value={newVoterName}
                  onChange={(e) => setNewVoterName(e.target.value)}
                  placeholder="Contoh: Ranting SMA Muh 3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <button disabled={submitting} type="submit" className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-70">
                {submitting ? "Membuat..." : "Simpan & Generate"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Generate */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Generate Banyak Token</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBulkAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Token (Maks. 100)</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg font-bold" 
                />
              </div>
              <p className="text-xs text-slate-500 text-center">Akan menghasilkan token acak tanpa nama spesifik.</p>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                  Batal
                </button>
                <button disabled={submitting} type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg py-2.5 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-70">
                  {submitting ? "Membuat..." : "Generate!"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Pemilih</h1>
          <p className="text-slate-500 mt-1">Kelola data pemilih, token, dan QR Code e-voting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a 
            href={`${basePath}/voters/print`}
            target="_blank"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            🖨️ Cetak Semua QR Code
          </a>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            + 1 Khusus
          </button>
          <button 
            onClick={handleAddRandom}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            <QrCode size={18} />
            + 1 Acak
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            + Generate Banyak
          </button>
          <button 
            onClick={handleDeleteAll}
            disabled={submitting}
            className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            <Trash2 size={18} />
            Hapus Semua
          </button>
        </div>
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
              ) : voters.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Belum ada pemilih. Tambahkan pemilih baru.</td></tr>
              ) : (
                voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{voter.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 text-blue-600 px-2 py-1 rounded font-mono text-sm border border-slate-200">
                          {voter.token}
                        </code>
                        <button 
                          onClick={() => setShowQR(voter.token)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Lihat QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                      </div>
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
                          onClick={() => handleDelete(voter.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}
