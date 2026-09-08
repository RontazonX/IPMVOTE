"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl w-96 focus-within:border-amber-500 transition-colors shadow-sm">
        <Search size={18} className="text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Cari sesuatu..." 
          className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-amber-500 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900">Admin Utama</p>
            <p className="text-xs text-slate-500">Panitia Pemilihan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
