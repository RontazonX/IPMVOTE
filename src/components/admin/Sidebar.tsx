"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, LogOut, Settings } from "lucide-react";
import clsx from "clsx";

export default function Sidebar({ role, electionId }: { role?: string, electionId?: string | null }) {
  const pathname = usePathname();

  const isSuperAdmin = role === 'superadmin';
  const isImpersonating = isSuperAdmin && electionId;

  const basePath = pathname.match(/^\/admin-[^\/]+/)?.[0] || '/admin';

  let menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: basePath },
    { icon: Users, label: "Kandidat Formatur", href: `${basePath}/candidates` },
    { icon: UserPlus, label: "Data Pemilih", href: `${basePath}/voters` },
  ];

  if (isSuperAdmin && !isImpersonating) {
    menuItems = [
      { icon: LayoutDashboard, label: "Pusat Pemantauan", href: basePath },
      { icon: Settings, label: "Manajemen Event", href: `${basePath}/elections` },
    ];
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">IPM<span className="text-amber-500">Vote</span></h2>
        <p className="text-xs text-slate-500 mt-1">{isSuperAdmin ? (isImpersonating ? "Memantau Event" : "Super Admin") : "Admin Panel"}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          // special case for dashboard (basePath) to exactly match
          const active = item.href === basePath ? pathname === basePath : isActive;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                active 
                  ? "bg-amber-50 text-amber-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={clsx("transition-transform group-hover:scale-110", active && "text-amber-600")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-2">
        {isImpersonating && (
          <button 
            onClick={() => {
              import("@/app/actions/adminAuth").then((m) => m.exitElection().then((res) => {
                if (res.success) window.location.href = res.redirectUrl!;
              }));
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Kembali ke Pusat
          </button>
        )}
        <button 
          onClick={() => {
            import("@/app/actions/adminAuth").then((m) => m.logoutAdmin());
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
