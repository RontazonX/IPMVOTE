"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, Home } from "lucide-react";
import { loginAdmin } from "../actions/adminAuth";
import Link from "next/link";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError("");
    
    try {
      const res = await loginAdmin(username, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(res.redirectUrl || "/admin");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors z-20 bg-white px-4 py-2 rounded-full border border-slate-200 font-medium">
        <Home size={18} /> Kembali
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-wrap w-full max-w-5xl overflow-hidden">
        
        {/* Left Side (Branding/Illustration) */}
        <div className="hidden w-full xl:block xl:w-1/2 p-12 lg:p-16 border-r border-slate-200 flex flex-col justify-center items-center text-center bg-slate-50/50">
          <Link className="mb-5 inline-block" href="/">
            <div className="flex items-center justify-center gap-3 text-3xl font-bold text-slate-900 mb-2">
              <ShieldCheck size={40} className="text-amber-500" />
              <span>IPMVote</span>
            </div>
          </Link>
          <p className="2xl:px-20 text-slate-500 text-center font-medium">
            Panel Admin Pemilihan. Masuk untuk mengelola data dan melihat hasil.
          </p>
          <div className="mt-12 w-full max-w-[350px] aspect-square relative mx-auto opacity-90 flex items-center justify-center">
            {/* Abstract SVG replacing illustration */}
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full text-amber-500/10">
               <path fill="currentColor" d="M42.7,-73.4C55.9,-67.8,67.6,-58.3,76.5,-46.5C85.4,-34.7,91.5,-20.5,91.8,-6.2C92.2,8.2,86.8,22.6,78.2,35.1C69.6,47.6,57.7,58.2,44.4,65.3C31.2,72.4,16.5,75.9,2.1,72.4C-12.2,68.9,-25.4,58.4,-38.7,50.1C-52,41.9,-65.4,35.9,-72.7,24.8C-80,13.8,-81.1,-2.3,-77.4,-17.1C-73.7,-31.8,-65.3,-45.3,-53.4,-51.7C-41.5,-58.1,-26.1,-57.4,-12.3,-60.7C1.5,-64,15.3,-71.4,28.6,-74.6C41.9,-77.8,54.7,-76.8,42.7,-73.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
            <ShieldCheck size={140} className="text-amber-500 z-10" />
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full xl:w-1/2">
          <div className="w-full p-8 sm:p-12.5 xl:p-17.5 bg-white h-full flex flex-col justify-center py-12 md:py-20 lg:p-16">
            <span className="mb-1.5 block font-medium text-slate-500">
              Selamat datang kembali
            </span>
            <h2 className="mb-9 text-2xl font-bold text-slate-900 sm:text-3xl">
              Masuk ke Panel Admin
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-slate-900">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-6 pr-10 outline-none focus:border-amber-500 text-slate-900 transition-colors placeholder:text-slate-400"
                    required
                  />
                  <span className="absolute right-4 top-4 text-slate-400">
                    <User size={22} />
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-slate-900">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-6 pr-10 outline-none focus:border-amber-500 text-slate-900 transition-colors placeholder:text-slate-400"
                    required
                  />
                  <span className="absolute right-4 top-4 text-slate-400">
                    <Lock size={22} />
                  </span>
                </div>
              </div>

              <div className="mb-5 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-xl border border-amber-500 bg-amber-500 p-4 text-white transition-all hover:bg-amber-600 disabled:opacity-70 font-medium text-lg flex items-center justify-center gap-2"
                >
                  {loading ? "Memverifikasi..." : "Masuk"}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
