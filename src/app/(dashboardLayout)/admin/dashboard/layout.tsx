"use client";

import AdminDashboardSidebar from "@/components/shared/admin-dashboard-sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f2ec_0%,#f1ebe2_48%,#ebe1d4_100%)] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <AdminDashboardSidebar />

        <div className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-black/5 bg-white/70 px-5 py-5 backdrop-blur-md sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Admin workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Dashboard Management
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-white/90 px-4 py-3 shadow-[0_18px_45px_-35px_rgba(95,76,55,0.35)] sm:justify-start">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-[linear-gradient(135deg,#ead8c2,#c7a783)]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Jhon Son</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8">
            <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_24px_60px_-45px_rgba(95,76,55,0.45)] backdrop-blur-md sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
