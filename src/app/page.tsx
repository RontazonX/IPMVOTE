import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Users, BarChart3, Layers, LockKeyhole } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CountingNumber } from "@/components/ui/counting-number";

export const runtime = 'edge';

export default async function LandingPage() {

  let errorMessage = null;
  const envInfo = { url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  
  let stats = {
    rantingCount: 0,
    cabangCount: 0,
    daerahCount: 0,
    wilayahCount: 0
  };

  try {
    const supabase = await createClient();
    const { data: elections, error: electionsError } = await supabase
      .from("elections")
      .select("level");

    if (electionsError) throw electionsError;

    if (elections) {
      stats = {
        rantingCount: elections.filter(e => e.level === 'Pimpinan Ranting').length,
        cabangCount: elections.filter(e => e.level === 'Pimpinan Cabang').length,
        daerahCount: elections.filter(e => e.level === 'Pimpinan Daerah').length,
        wilayahCount: elections.filter(e => e.level === 'Pimpinan Wilayah').length,
      };
    }
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-900">
            IPM<span className="text-amber-500">Vote</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-500">
            <a href="#home" className="hover:text-amber-500 transition-colors">Beranda</a>
            <a href="#fitur" className="hover:text-amber-500 transition-colors">Fitur Unggulan</a>
            <a href="#cara-voting" className="hover:text-amber-500 transition-colors">Cara Voting</a>
            <a href="#about" className="hover:text-amber-500 transition-colors">Tentang</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/admin-login"
              className="hidden md:block font-semibold text-slate-500 hover:text-amber-500 transition-colors"
            >
              Login Panitia
            </Link>
            <Link
              href="/login"
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:-translate-y-0.5"
            >
              Mulai Voting
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-amber-600 font-medium text-sm mb-8 border border-amber-200 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              Platform Pemilihan Digital Muhammadiyah
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              E-Voting Modern <br className="hidden md:block" />
              <span className="text-amber-500">Pelajar Muhammadiyah</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Solusi digital terbaik untuk Musyran, Musycab, Musyda, hingga Muktamar. Kelola pemilihan formatur dengan mudah, aman, hemat biaya, dan dukung banyak pemilihan sekaligus secara bersamaan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Masuk ke Bilik Suara <ArrowRight size={20} />
              </Link>
              <Link
                href="#fitur"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-lg px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </section>

        {/* Statistik Penggunaan */}
        <section className="py-16 bg-amber-50 border-b border-amber-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight text-amber-600 sm:text-5xl mb-2 flex items-center justify-center">
                  <CountingNumber target={stats.rantingCount} />
                </div>
                <p className="text-sm font-medium text-amber-900/70">Pimpinan Ranting</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight text-amber-600 sm:text-5xl mb-2 flex items-center justify-center">
                  <CountingNumber target={stats.cabangCount} />
                </div>
                <p className="text-sm font-medium text-amber-900/70">Pimpinan Cabang</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight text-amber-600 sm:text-5xl mb-2 flex items-center justify-center">
                  <CountingNumber target={stats.daerahCount} />
                </div>
                <p className="text-sm font-medium text-amber-900/70">Pimpinan Daerah</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight text-amber-600 sm:text-5xl mb-2 flex items-center justify-center">
                  <CountingNumber target={stats.wilayahCount} />
                </div>
                <p className="text-sm font-medium text-amber-900/70">Pimpinan Wilayah</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur Unggulan */}
        <section id="fitur" className="py-24 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Menggunakan IPMVote?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Kami merancang platform ini dengan mempertimbangkan segala kebutuhan musyawarah di seluruh tingkatan Ikatan Pelajar Muhammadiyah.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all group">
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">Multi-Pemilihan</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Satu sistem untuk banyak acara. Buat ruang pemilihan (Election) secara mandiri untuk Musyran A, Musycab B, hingga Musyda C secara bersamaan tanpa saling mengganggu.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all group">
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">100% Aman & Rahasia</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Tidak ada yang bisa melihat siapa memilih siapa. Menggunakan token unik sekali pakai yang menjamin kerahasiaan pilihan dan mencegah pemilih ganda.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all group">
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">Live Result Dinamis</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Hasil pemungutan suara dihitung seketika dan dapat ditampilkan kepada publik melalui link dinamis kapan pun panitia siap.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all group">
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LockKeyhole size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">Manajemen Panitia</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pembuat event (Superadmin) dapat mendelegasikan hak akses kepada panitia lokal (Admin) yang bertugas spesifik untuk mengelola kandidat & pemilih di satu event saja.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tata Cara Voting */}
        <section id="cara-voting" className="py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Bagaimana Cara Peserta Memilih?</h2>
              <p className="text-slate-500">Proses pemilihan bagi peserta musyawarah dirancang agar sangat intuitif.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-12"></div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:border-amber-400 transition-all">
                <div className="w-20 h-20 bg-white border-4 border-slate-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <QrCode size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Login dengan Token</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pemilih mendapatkan Token Rahasia yang digenerate oleh sistem, lalu menggunakannya untuk masuk ke halaman bilik suara event terkait.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:border-amber-400 transition-all">
                <div className="w-20 h-20 bg-white border-4 border-slate-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Pilih Formatur</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pemilih menyeleksi dan mencentang nama-nama kandidat formatur terbaik berdasarkan profil & rekam jejak.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:border-amber-400 transition-all">
                <div className="w-20 h-20 bg-white border-4 border-slate-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Konfirmasi Suara</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Suara divalidasi dan dikirim ke server secara terenkripsi. Selesai! Pemilih secara otomatis tercatat "Sudah Memilih".
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang Section */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Mendigitalkan Demokrasi Pelajar</h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              IPMVote hadir sebagai respon atas kebutuhan sistem e-voting yang handal, cepat, dan transparan di lingkup Ikatan Pelajar Muhammadiyah. Dengan mengusung arsitektur Multi-Tenant, satu instansi platform ini sanggup melayani puluhan Ranting dan Cabang secara bersamaan tanpa perlu *setup* server baru berulang kali.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span className="font-medium">Paperless (Ramah Lingkungan)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span className="font-medium">Teknologi Terkini (Next.js)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span className="font-medium">Akses Cepat & Responsif</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-500 py-10 text-center border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-bold text-xl tracking-tight text-slate-800 mb-4">
            IPM<span className="text-amber-500">Vote</span>
          </div>
          <p className="mb-2">© {new Date().getFullYear()} IPMVote Platform. Hak Cipta Dilindungi.</p>
          <p className="text-sm">Dedikasi untuk Ikatan Pelajar Muhammadiyah di Seluruh Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
