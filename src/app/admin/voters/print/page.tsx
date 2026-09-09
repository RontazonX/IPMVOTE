"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";

type Voter = {
  id: string;
  name: string;
  token: string;
  is_voted: boolean;
};

import { usePathname } from "next/navigation";

export default function PrintVoters() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const basePath = pathname.match(/^\/admin-[^\/]+/)?.[0] || '/admin';

  useEffect(() => {
    async function fetchVoters() {
      const supabase = createClient();
      const { data } = await supabase.from("voters").select("*").order("created_at", { ascending: false });
      if (data) setVoters(data);
      setLoading(false);
      
      // Auto open print dialog when loaded
      if (data && data.length > 0) {
        setTimeout(() => window.print(), 1000);
      }
    }
    fetchVoters();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Memuat data cetak...</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8">
      <div className="print:hidden mb-8 flex justify-between items-center bg-slate-100 p-4 rounded-lg">
        <p className="font-medium text-slate-600">Tekan tombol di bawah atau CTRL+P untuk mencetak Token & QR Code.</p>
        <div className="space-x-4">
          <a href={`${basePath}/voters`} className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50">Kembali</a>
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cetak Sekarang</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4 print:text-black">
        {voters.map((voter) => (
          <div key={voter.id} className="border-2 border-slate-800 p-4 rounded-xl text-center flex flex-col items-center break-inside-avoid">
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{voter.name}</h3>
            <div className="bg-white p-2 border border-slate-300 rounded-lg inline-block mb-3">
              <QRCodeSVG value={typeof window !== 'undefined' ? `${window.location.origin}/login?token=${voter.token}` : voter.token} size={120} level="H" />
            </div>
            <p className="font-mono font-bold text-xl tracking-widest">{voter.token}</p>
            <p className="text-xs text-slate-500 mt-2">Scan untuk masuk ke Bilik Suara</p>
          </div>
        ))}
      </div>
    </div>
  );
}
