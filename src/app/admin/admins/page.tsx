"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/app/actions/admins";
import { getAdminElectionInfo, getElections } from "@/app/actions/elections";

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    role: "admin",
    election_id: ""
  });
  const [isEdit, setIsEdit] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [adminsRes, electionsRes] = await Promise.all([
      getAdmins(),
      getElections()
    ]);
    
    if (adminsRes.admins) {
      setAdmins(adminsRes.admins);
    }
    
    if (electionsRes.elections) {
      setElections(electionsRes.elections);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = new FormData();
    data.append("username", formData.username);
    data.append("role", formData.role);
    if (formData.password) {
      data.append("password", formData.password);
    }
    if (formData.role === "admin" && formData.election_id) {
      data.append("election_id", formData.election_id);
    }

    let res;
    if (isEdit) {
      res = await updateAdmin(formData.id, data);
    } else {
      res = await createAdmin(data);
    }

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEdit ? "Admin berhasil diperbarui!" : "Admin baru berhasil ditambahkan!");
      setShowModal(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus admin ini? Aksi ini tidak dapat dibatalkan.")) return;
    const res = await deleteAdmin(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Admin berhasil dihapus!");
      fetchData();
    }
  };

  const openAddModal = () => {
    setFormData({ id: "", username: "", password: "", role: "admin", election_id: "" });
    setIsEdit(false);
    setShowModal(true);
  };

  const openEditModal = (admin: any) => {
    setFormData({ 
      id: admin.id, 
      username: admin.username, 
      password: "", // Jangan isi password agar tidak berubah kecuali diketik
      role: admin.role, 
      election_id: admin.election_id || "" 
    });
    setIsEdit(true);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Admin</h1>
          <p className="text-slate-500 mt-1">Kelola akun Admin Cabang dan hak akses pemilihan mereka.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Event Pemilihan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Belum ada admin lain.</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      {admin.role === 'superadmin' && <ShieldAlert size={16} className="text-amber-500" />}
                      {admin.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${admin.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin Cabang'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {admin.role === 'superadmin' ? (
                        <span className="text-slate-400 italic">Semua Event</span>
                      ) : (
                        admin.elections?.name || <span className="text-red-500 text-sm">Belum Ditugaskan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{isEdit ? 'Edit Admin' : 'Tambah Admin Baru'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {isEdit && <span className="text-slate-400 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  required={!isEdit}
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value, election_id: e.target.value === 'superadmin' ? '' : formData.election_id})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="admin">Admin Cabang</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {formData.role === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tugaskan ke Event Pemilihan</label>
                  <select 
                    value={formData.election_id}
                    onChange={(e) => setFormData({...formData, election_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required={formData.role === "admin"}
                  >
                    <option value="">-- Pilih Event --</option>
                    {elections.map(el => (
                      <option key={el.id} value={el.id}>{el.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  disabled={submitting} 
                  type="submit" 
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl py-2.5 transition-colors disabled:opacity-70"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
