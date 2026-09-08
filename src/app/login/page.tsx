"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight, QrCode, X, Home } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { loginWithToken } from "../actions/auth";
import Link from "next/link";

export default function Login() {
  const [token, setToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setToken(decodedText);
          setIsScanning(false);
          if (scanner) scanner.clear();
        },
        () => {
          // Ignore
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Error clearing scanner", e));
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

  useEffect(() => {
    if (token && !isScanning) {
      const t = setTimeout(() => {
        handleLogin();
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isScanning]);

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
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 border border-amber-100 rounded-2xl flex items-center justify-center rotate-3">
              <KeyRound size={32} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Verifikasi Identitas</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          {isScanning ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-slate-200"></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full flex justify-center items-center gap-2 text-slate-500 hover:text-slate-800 py-2 transition-colors"
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
                  className="w-full text-center text-lg tracking-widest font-mono bg-white border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-4 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-300"
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
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">ATAU</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all"
              >
                <QrCode size={20} />
                Scan QR Code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
