"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  CreditCard,
  Gift,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldBan,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  exact?: boolean;
  indent?: boolean;
  activeFor?: string[];
  children?: NavItem[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type AdminSidebarUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
  role?: string | null;
};

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "User Management",
    items: [
      {
        label: "Users",
        icon: Users,
        activeFor: ["/admin/dashboard/users", "/admin/dashboard/users/profile"],
        children: [
          { label: "All Users", href: "/admin/dashboard/users", icon: Users, indent: true, exact: true },
          { label: "Active Users", href: "/admin/dashboard/users/unblocked", icon: Users, indent: true },
          { label: "Blocked Users", href: "/admin/dashboard/users/blocked", icon: ShieldBan, indent: true },
        ],
      }
    ],
  },
  {
    title: "Content",
    items: [
      { label: "All Posts", href: "/admin/dashboard/posts", icon: WalletCards },
      { label: "Interests", href: "/admin/dashboard/interests", icon: Layers3 },
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

function isActivePath(pathname: string, href: string, activeFor?: string[], exact?: boolean) {
  if (pathname === href) return true;

  if (!exact && href !== "/admin/dashboard" && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return activeFor ? activeFor.some((item) => pathname === item || pathname.startsWith(`${item}/`)) : false;
}

export default function AdminDashboardSidebar({ user }: { user?: AdminSidebarUser | null }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Admin User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user?.role || "Admin";

  useEffect(() => {
    const shouldOpenUsers =
      pathname === "/admin/dashboard/users" ||
      pathname.startsWith("/admin/dashboard/users/");

    setOpenGroups((current) => ({
      ...current,
      Users: current.Users ?? shouldOpenUsers,
    }));
  }, [pathname]);

  return (
    <aside className="sticky top-0 h-screen border-r border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,231,0.96))] px-5 py-6 shadow-[18px_0_45px_-40px_rgba(95,76,55,0.35)]">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 rounded-[1.75rem] bg-white/85  ">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.35rem] bg-white shadow-[inset_0_0_0_1px_rgba(95,76,55,0.08)]">
            <Image
              src="/assets/logo.png"
              alt="Friendzo logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Admin Panel
            </p>
            <h1 className="mt-1 text-lg font-semibold text-foreground">Friendzo</h1>
          </div>
        </div>

        <nav className="mt-8 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {section.title}
              </p>
              <div className="mt-3 space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isGroup = Boolean(item.children?.length);
                  const isActive = item.href ? isActivePath(pathname, item.href, item.activeFor, item.exact) : false;
                  const isChildActive = item.children?.some(
                    (child) => child.href && isActivePath(pathname, child.href, child.activeFor, child.exact)
                  ) ?? false;
                  const isExpanded = openGroups[item.label] ?? isChildActive;

                  return (
                    <div key={item.href || item.label}>
                      {isGroup ? (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenGroups((current) => ({
                              ...current,
                              [item.label]: !isExpanded,
                            }))
                          }
                          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                            isChildActive
                              ? "bg-primary text-primary-foreground shadow-[0_18px_35px_-25px_rgba(109,87,67,0.55)]"
                              : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      ) : item.href ? (
                        <Link
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
                      ) : null}

                      {isGroup && isExpanded ? (
                        <div className="mt-1.5 space-y-1.5">
                          {item.children?.map((child) => {
                            if (!child.href) return null;

                            const ChildIcon = child.icon;
                            const isChildLinkActive = isActivePath(pathname, child.href, child.activeFor, child.exact);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`ml-5 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-medium transition-all ${
                                  isChildLinkActive
                                    ? "bg-primary text-primary-foreground shadow-[0_18px_35px_-25px_rgba(109,87,67,0.55)]"
                                    : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                                }`}
                              >
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-[1.55rem]  shadow-[0_18px_45px_-35px_rgba(95,76,55,0.28)]">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[linear-gradient(135deg,#ead8c2,#c7a783)]">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                  {userInitial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || "No email found"}</p>
            </div>
          </div>

          <div className="mt-3 inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {userRole}
          </div>
        </div>
      </div>
    </aside>
  );
}
