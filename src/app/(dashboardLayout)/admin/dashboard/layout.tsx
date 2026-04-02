"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  Gift,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldBan,
  Users,
  UserSquare2,
  WalletCards,
} from "lucide-react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const navSections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "User Management",
    items: [
      {
        label: "All Users",
        href: "/admin/dashboard/users",
        icon: Users,
        activeFor: ["/admin/dashboard/users", "/admin/dashboard/my-profile"],
      },
      { label: "Social Users", href: "/admin/dashboard/users/social", icon: UserSquare2, indent: true },
      { label: "Dating Users", href: "/admin/dashboard/users/dating", icon: UserSquare2, indent: true },
      { label: "Blocked Users", href: "/admin/dashboard/users/blocked", icon: ShieldBan, indent: true },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "All Posts", href: "/admin/dashboard/posts", icon: WalletCards },
      { label: "Gift Cards", href: "/admin/dashboard/gift-cards", icon: Gift },
      { label: "Coin Prices", href: "/admin/dashboard/coin-prices", icon: BadgeDollarSign },
      { label: "Chat Monitor", href: "/admin/dashboard/chat-monitor", icon: MessageSquareText },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
      { label: "Managers", href: "/admin/dashboard/managers", icon: Users },
      { label: "Reports", href: "/admin/dashboard/reports", icon: BarChart3 },
      { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ],
  },
];

function isActivePath(pathname: string, href: string, activeFor?: string[]) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  return activeFor ? activeFor.some((item) => pathname === item || pathname.startsWith(`${item}/`)) : false;
}

export default function Layout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f2ec_0%,#f1ebe2_48%,#ebe1d4_100%)] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-r border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,231,0.96))] px-5 py-6 shadow-[18px_0_45px_-40px_rgba(95,76,55,0.35)]">
          <div className="sticky top-6">
            <div className="flex items-center gap-3 rounded-[1.75rem] bg-white/85 p-4 shadow-[0_18px_45px_-35px_rgba(95,76,55,0.35)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[radial-gradient(circle_at_top,#7d5a35_0%,#5f4327_50%,#3d2a17_100%)] text-lg font-semibold text-white">
                FZ
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Admin Panel
                </p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">Friendzo Console</h1>
              </div>
            </div>

            <nav className="mt-8 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {section.title}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActivePath(pathname, item.href, item.activeFor);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-[0_18px_35px_-25px_rgba(109,87,67,0.55)]"
                              : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                          } ${item.indent ? "ml-5 py-2.5 text-[13px]" : ""}`}
                        >
                          <Icon className={`${item.indent ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} shrink-0`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

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
