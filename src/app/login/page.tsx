"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight, QrCode, X, Home, Camera } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { loginWithToken } from "../actions/auth";
import Link from "next/link";

export default function Login() {
  const [token, setToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      if (tokenParam) {
        setToken(tokenParam.toUpperCase());
      }
    }
  }, []);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;

    if (isScanning) {
      html5QrCode = new Html5Qrcode("qr-reader-custom");
      
      html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        },
        (decodedText) => {
          if (!isComponentMounted) return;
          
          let finalToken = decodedText;
          if (decodedText.includes("token=")) {
            try {
              // Jika ini URL lengkap, ambil parameter token-nya saja
              const url = new URL(decodedText);
              finalToken = url.searchParams.get("token") || decodedText;
            } catch {
              // Jika parsing gagal, gunakan decoded text as is
            }
          }
          
          setToken(finalToken.toUpperCase());
          setIsScanning(false);
        },
        () => {
          // Ignore scanning errors (happens when no QR found in frame)
        }
      ).catch(err => {
        if (!isComponentMounted) return;
        console.error("Error starting camera", err);
        setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        setIsScanning(false);
      });
    }

    return () => {
      isComponentMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode?.clear()).catch(console.error);
      }
    };
  }, [isScanning]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError("");
    
    try {
      const res = await loginWithToken(token);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/vote");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors z-20 bg-white px-4 py-2 rounded-full border border-slate-200">
        <Home size={18} /> Kembali ke Beranda
      </Link>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">E-Voting <span className="text-amber-500">Formatur</span></h1>
          <p className="text-slate-500">Autentikasi Pemilih IPMVote</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {!isScanning && (
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 border border-amber-100 rounded-2xl flex items-center justify-center rotate-3">
                <KeyRound size={32} />
              </div>
            </div>
          )}

          <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
            {isScanning ? "Arahkan Kamera ke QR Code" : "Verifikasi Identitas"}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          {isScanning ? (
            <div className="space-y-6">
              <div className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-inner">
                {/* Custom target overlay for the scanner */}
                <div className="absolute inset-0 z-10 border-[50px] border-black/40 pointer-events-none"></div>
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-amber-500 rounded-xl relative">
                    {/* Scanner scanning line animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/80 shadow-[0_0_10px_2px_rgba(245,158,11,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
                {/* The actual video element will be placed here by Html5Qrcode */}
                <div id="qr-reader-custom" className="w-full h-full object-cover"></div>
              </div>
              
              <button
                onClick={() => setIsScanning(false)}
                className="w-full flex justify-center items-center gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl py-3 transition-colors font-medium"
              >
                <X size={18} /> Batalkan Scan
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="Masukkan Token Manual"
                  className="w-full text-center text-lg tracking-widest font-mono bg-white border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-4 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-300 uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
              >
                {loading ? "Memverifikasi..." : "Masuk & Mulai Memilih"}
                {!loading && <ArrowRight size={20} />}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">ATAU</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all group shadow-md hover:shadow-lg"
              >
                <Camera size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                Scan QR Code
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* CSS for custom scan line animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(188px); opacity: 0; }
        }
        #qr-reader-custom video {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
      `}} />
    </div>
  );
}
