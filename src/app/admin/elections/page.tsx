"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getAllElections, createElectionAndAdmin, updateElectionAndAdmin } from "@/app/actions/elections";
import { Eye, EyeOff, Copy, Edit, X } from "lucide-react";

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

  // Edit states
  const [editingElection, setEditingElection] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("Pimpinan Ranting");
  const [editMaxSelected, setEditMaxSelected] = useState(9);
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
      toast.error(res.error);
    } else {
      toast.success("Event Pemilihan dan Admin berhasil dibuat!");
      setName("");
      setSlug("");
      setLevel("Pimpinan Ranting");
      setMaxSelectedFormaturs(9);
      setAdminUsername("");
      setAdminPassword("");
      fetchElections(); // refresh list
    }
  };

  const handleEditClick = (election: any) => {
    setEditingElection(election);
    setEditName(election.name);
    setEditLevel(election.level || "Pimpinan Ranting");
    setEditMaxSelected(election.max_selected_formaturs || 9);
    setEditAdminPassword(election.admins && election.admins.length > 0 ? election.admins[0].password : "");
    setShowPassword(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const adminId = editingElection.admins && editingElection.admins.length > 0 ? editingElection.admins[0].id : undefined;
    
    const res = await updateElectionAndAdmin(
      editingElection.id, 
      editName, 
      editLevel, 
      editMaxSelected,
      adminId,
      editAdminPassword
    );
    
    setIsUpdating(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Event Pemilihan berhasil diperbarui!");
      setEditingElection(null);
      fetchElections();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard!`);
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
                  <th className="px-4 py-3 font-medium">Tanggal Dibuat</th>
                  <th className="px-4 py-3 font-medium rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {elections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-500">Belum ada event pemilihan.</td>
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
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => handleEditClick(election)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit size={14} /> Edit & Info
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

      {/* Edit Modal */}
      {editingElection && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Event & Kredensial</h2>
              <button 
                onClick={() => setEditingElection(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-6">
                
                {/* Admin Credentials Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Eye size={16} /> Kredensial Admin Saat Ini
                  </h3>
                  {editingElection.admins && editingElection.admins.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Username</label>
                        <div className="flex items-center justify-between bg-white px-3 py-2 border border-blue-100 rounded-lg">
                          <span className="font-mono text-sm text-slate-800">{editingElection.admins[0].username}</span>
                          <button 
                            type="button" 
                            onClick={() => copyToClipboard(editingElection.admins[0].username, "Username")}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Password</label>
                        <div className="flex items-center justify-between bg-white px-3 py-2 border border-blue-100 rounded-lg">
                          <span className="font-mono text-sm text-slate-800">
                            {showPassword ? editingElection.admins[0].password : '••••••••'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => copyToClipboard(editingElection.admins[0].password, "Password")}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">Tidak ada admin yang terhubung ke event ini.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 border-b pb-2">Ubah Data Event</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nama Event Pemilihan</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Slug (URL) - <span className="text-orange-500 text-xs font-normal">Tidak dapat diubah untuk menjaga integritas link yang sudah disebar</span></label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      value={editingElection.slug}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Tingkat Pimpinan</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white"
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value)}
                      >
                        <option value="Pimpinan Ranting">Pimpinan Ranting</option>
                        <option value="Pimpinan Cabang">Pimpinan Cabang</option>
                        <option value="Pimpinan Daerah">Pimpinan Daerah</option>
                        <option value="Pimpinan Wilayah">Pimpinan Wilayah</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Max Formatur Terpilih</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        value={editMaxSelected}
                        onChange={(e) => setEditMaxSelected(parseInt(e.target.value) || 9)}
                      />
                    </div>
                  </div>
                  
                  {/* Reset Password Section */}
                  {editingElection.admins && editingElection.admins.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-slate-700">Ganti Password Admin</label>
                      <input 
                        type="text" 
                        placeholder="Kosongkan jika tidak ingin mengubah password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        value={editAdminPassword}
                        onChange={(e) => setEditAdminPassword(e.target.value)}
                      />
                      <p className="text-xs text-slate-500">Edit jika ingin mereset password admin tersebut.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingElection(null)}
                    className="px-5 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70 transition-colors"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
