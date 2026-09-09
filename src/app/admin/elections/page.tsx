"use client";

import { useEffect, useState } from "react";
import { getAllElections, createElectionAndAdmin } from "@/app/actions/elections";

export default function ElectionsManagementPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState("Pimpinan Ranting");
  const [maxSelectedFormaturs, setMaxSelectedFormaturs] = useState(9);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  async function fetchElections() {
    setLoading(true);
    const res = await getAllElections();
    if (res.elections) {
      setElections(res.elections);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchElections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await createElectionAndAdmin(name, slug, adminUsername, adminPassword, level, maxSelectedFormaturs);
    setIsSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      alert("Event Pemilihan dan Admin berhasil dibuat!");
      setName("");
      setSlug("");
      setLevel("Pimpinan Ranting");
      setMaxSelectedFormaturs(9);
      setAdminUsername("");
      setAdminPassword("");
      fetchElections(); // refresh list
    }
  };

  if (loading) {
    return <div>Memuat data event...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Event Pemilihan</h1>
        <p className="text-slate-500 mt-1">Superadmin: Buat event baru dan kelola akun adminnya.</p>
      </div>

      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm max-w-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Buat Event Baru</h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Event Pemilihan</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Pimpinan Ranting A"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
              <input 
                type="text" 
                required
                readOnly
                placeholder="Otomatis terisi dari nama"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none text-slate-500 cursor-not-allowed"
                value={slug}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tingkat Pimpinan</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="Pimpinan Ranting">Pimpinan Ranting</option>
                <option value="Pimpinan Cabang">Pimpinan Cabang</option>
                <option value="Pimpinan Daerah">Pimpinan Daerah</option>
                <option value="Pimpinan Wilayah">Pimpinan Wilayah</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Formatur Terpilih (Maksimal)</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                value={maxSelectedFormaturs}
                onChange={(e) => setMaxSelectedFormaturs(parseInt(e.target.value) || 9)}
              />
              <p className="text-xs text-slate-500 mt-1">Berapa banyak calon formatur yang dapat/harus dipilih oleh pemilih.</p>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Akun Admin Event</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Username / Email Admin</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: admin_ranting_a"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password Admin</label>
                <input 
                  type="text" 
                  required
                  placeholder="Password aman"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Event & Admin"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Daftar Event Pemilihan</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm">
                  <th className="px-4 py-3 font-medium rounded-l-lg">Nama Event</th>
                  <th className="px-4 py-3 font-medium">Tingkat</th>
                  <th className="px-4 py-3 font-medium">Slug / URL</th>
                  <th className="px-4 py-3 font-medium">Status Publikasi</th>
                  <th className="px-4 py-3 font-medium">Akun Admin</th>
                  <th className="px-4 py-3 font-medium rounded-r-lg">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {elections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">Belum ada event pemilihan.</td>
                  </tr>
                ) : (
                  elections.map((election) => (
                    <tr key={election.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-800">{election.name}</td>
                      <td className="px-4 py-4">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded text-xs font-bold">{election.level || 'Ranting'}</span>
                      </td>
                      <td className="px-4 py-4 font-mono text-sm text-blue-600">/result/{election.slug}</td>
                      <td className="px-4 py-4">
                        {election.is_result_published ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Dipublikasi</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Ditutup</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {election.admins && election.admins.length > 0 ? (
                          <span className="text-slate-700">{election.admins[0].username}</span>
                        ) : (
                          <span className="text-red-500 text-sm">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {new Date(election.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
