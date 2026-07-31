import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const runtime = 'edge';

export default async function LandingPage() {

  let errorMessage = null;
  const envInfo = { url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("candidates").select("*").order("order_number", { ascending: true });
    if (error) throw error;
    // candidates are selected to test connection but currently not used in landing view
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 text-red-900">
        <h1 className="text-2xl font-bold mb-4">Server Runtime Error</h1>
        <p className="mb-2"><strong>Error:</strong> {errorMessage}</p>
        <p className="mb-2"><strong>Supabase URL Present?</strong> {envInfo.url ? "Yes" : "No"}</p>
        <p className="mb-2"><strong>Supabase Key Present?</strong> {envInfo.key ? "Yes" : "No"}</p>
        <p className="mt-4 text-sm opacity-70">Please check your Cloudflare Environment Variables and redeploy.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-yellow-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-800">
            IPM<span className="text-yellow-600">Vote</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#home" className="hover:text-yellow-600 transition-colors">Beranda</a>
            <Link href="/formatur" className="hover:text-yellow-600 transition-colors">Formatur</Link>
            <a href="#cara-voting" className="hover:text-yellow-600 transition-colors">Cara Voting</a>
            <a href="#about" className="hover:text-yellow-600 transition-colors">Tentang</a>
            <Link href="/result" className="hover:text-yellow-600 transition-colors">Result</Link>
          </nav>
          <Link
            href="/login"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:-translate-y-0.5 shadow-md shadow-yellow-600/20"
          >
            Mulai Voting
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white -z-10"></div>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Tentukan Masa Depan <br className="hidden md:block" />
              <span className="text-yellow-600">IPM Wirobrajan</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Gunakan hak suara Anda dengan mudah, aman, dan rahasia melalui platform e-voting resmi Pimpinan Cabang Ikatan Pelajar Muhammadiyah Wirobrajan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white text-lg px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-yellow-600/30 flex items-center justify-center gap-2"
              >
                Masuk ke Bilik Suara <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Tata Cara Voting */}
        <section id="cara-voting" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Bagaimana Cara Memilih?</h2>
              <p className="text-slate-600">Proses pemilihan dirancang agar sangat mudah dan cepat.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg hover:border-yellow-100 transition-all">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <QrCode size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Scan QR Code</h3>
                <p className="text-slate-600">Dapatkan QR Code atau Token dari panitia, lalu scan menggunakan kamera HP Anda di halaman login.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg hover:border-yellow-100 transition-all">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Pilih 9 Formatur</h3>
                <p className="text-slate-600">Pilih tepat 9 (sembilan) kandidat formatur terbaik menurut Anda dari daftar yang tersedia.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center hover:shadow-lg hover:border-yellow-100 transition-all">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Kirim Suara</h3>
                <p className="text-slate-600">Klik tombol kirim. Suara Anda akan dienkripsi dan disimpan secara anonim dalam sistem.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang Section */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Tentang E-Voting Formatur</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Aplikasi ini dikembangkan khusus untuk memfasilitasi proses demokrasi pelajar Muhammadiyah di cabang Wirobrajan.
              Menggunakan teknologi modern Next.js dan Supabase, kami menjamin transparansi, kecepatan perhitungan, dan kerahasiaan pilihan setiap peserta musyawarah.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="font-medium">100% Rahasia</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="font-medium">Real-time Counting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="font-medium">Anti Golput ganda</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <p className="mb-2">© {new Date().getFullYear()} PC IPM Wirobrajan. Hak cipta dilindungi.</p>
          <p className="text-sm">Dikembangkan untuk Musyawarah Cabang IPM Wirobrajan.</p>
        </div>
      </footer>
    </div>
  );
}
// Force rebuild
