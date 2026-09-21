"use client";

import { Bell, Search, User, Check, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications";
import { toast } from "sonner";

export default function Header({ 
  username = "Admin", 
  roleText = "Panitia Pemilihan" 
}: { 
  username?: string;
  roleText?: string;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    const res = await getNotifications();
    if (res.notifications) setNotifications(res.notifications);
  };

  useEffect(() => {
    fetchNotifs();
    // Tutup dropdown jika klik di luar
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    fetchNotifs();
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
    fetchNotifs();
    toast.success("Semua notifikasi ditandai sudah dibaca");
  };

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative p-2 rounded-full transition-colors ${showDropdown ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50 hover:text-amber-500'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Belum ada notifikasi
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 transition-colors hover:bg-slate-50 flex gap-3 ${!notif.is_read ? 'bg-amber-50/30' : ''}`}>
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => handleMarkRead(notif.id, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0 h-fit"
                            title="Tandai dibaca"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900">{username}</p>
            <p className="text-xs text-slate-500">{roleText}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
