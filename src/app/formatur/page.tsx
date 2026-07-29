import Link from "next/link";
import { ArrowLeft, Building, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const runtime = 'edge';

export default async function FormaturPage() {
  const supabase = await createClient();
  const { data: candidates } = await supabase.from("candidates").select("*").order("order_number", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-800">
            IPM<span className="text-blue-600">Vote</span>
          </div>
          <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft size={20} /> Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="py-24 bg-white min-h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Daftar Calon Formatur
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Kenali calon-calon pemimpin masa depan Pimpinan Cabang Ikatan Pelajar Muhammadiyah Wirobrajan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {candidates?.map((candidate) => (
              <div key={candidate.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-56 bg-slate-200 relative overflow-hidden">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={40} className="opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-900/20">
                    {candidate.order_number}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-slate-800 mb-3">{candidate.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
                    <Building size={14} className="text-slate-400" />
                    <span>{candidate.asal_pimpinan}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {(!candidates || candidates.length === 0) && (
              <div className="col-span-full text-center py-20">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 max-w-lg mx-auto">
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Data</h3>
                  <p className="text-slate-500">Belum ada data calon formatur yang dipublikasikan oleh panitia.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
