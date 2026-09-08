import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { getAdminSession } from "@/utils/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin-login");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar role={session.role} electionId={session.election_id} />
      </div>
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden print:overflow-visible print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
