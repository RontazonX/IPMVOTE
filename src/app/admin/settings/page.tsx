"use client";

import { useState, useEffect } from "react";
import { getAppSettings, updateAppSettings } from "@/app/actions/settings";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bgType, setBgType] = useState("default");
  const [bgValue, setBgValue] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const settings = await getAppSettings();
      setBgType(settings.background_type || "default");
      setBgValue(settings.background_value || "");
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("background_type", bgType);
    formData.append("background_value", bgValue);

    const res = await updateAppSettings(formData);
    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Pengaturan tampilan beranda berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (loading) return <div className="text-slate-500">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-amber-500" />
            Pengaturan Tampilan Aplikasi
          </h1>
          <p className="text-slate-500 mt-1">Ubah tampilan halaman depan/beranda aplikasi E-Voting.</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
          Kembali
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Latar Belakang (Background) Beranda</h2>
        
        {successMsg && (
          <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Tipe Latar Belakang</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${bgType === 'default' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <input type="radio" name="bgType" value="default" checked={bgType === 'default'} onChange={() => setBgType('default')} className="sr-only" />
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">🎨</div>
                <span className="font-medium text-sm">Default (Warna Solid)</span>
              </label>

              <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${bgType === 'youtube' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <input type="radio" name="bgType" value="youtube" checked={bgType === 'youtube'} onChange={() => setBgType('youtube')} className="sr-only" />
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">▶</div>
                <span className="font-medium text-sm">Video YouTube</span>
              </label>

              <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${bgType === 'image' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <input type="radio" name="bgType" value="image" checked={bgType === 'image'} onChange={() => setBgType('image')} className="sr-only" />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">🖼</div>
                <span className="font-medium text-sm">Gambar (Foto)</span>
              </label>
            </div>
          </div>

          {bgType !== 'default' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {bgType === 'youtube' ? 'Link Video / ID YouTube' : 'URL Gambar (Link)'}
              </label>
              <input
                type="text"
                value={bgValue}
                onChange={(e) => setBgValue(e.target.value)}
                placeholder={bgType === 'youtube' ? 'Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'Contoh: https://domain.com/foto.jpg'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                required={bgType !== 'default'}
              />
              <p className="text-xs text-slate-500">
                {bgType === 'youtube' ? 'Video akan otomatis diputar (autoplay) tanpa suara di belakang halaman utama.' : 'Masukkan link URL gambar langsung (akhiran .jpg / .png) untuk jadi latar belakang penuh.'}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? 'Menyimpan...' : <><Save size={18} /> Simpan Pengaturan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
