"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Compass,
  HeartHandshake,
  Home as HomeIcon,
  Info,
  ShieldCheck,
  StoreIcon,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export const navLinks = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Friends", href: "/friends", icon: HeartHandshake },
  { name: "About Us", href: "/about", icon: Info },
  { name: "Store", href: "/store", icon: StoreIcon },
  { name: "Admin", href: "/admin/dashboard", icon: ShieldCheck },
];

type NavigationSidebarProps = {
  /** Optional extra card rendered below the nav links */
  children?: React.ReactNode;
};

export default function NavigationSidebar({ children }: NavigationSidebarProps) {
  const pathname = usePathname();
  const userRole = useUserRole();

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-5">
        <div className="overflow-hidden rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Navigation
          </p>
          <div className="mt-4 space-y-2">
            {navLinks
              .filter((item) => {
                // Hide Admin link for non-admin users
                if (item.name === "Admin" && userRole !== "ADMIN") {
                  return false;
                }
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              // Home is active only on exact match; others match by prefix
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-foreground hover:bg-primary/8"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>
              );
            })}
          </div>
        </div>

        {children}
      </div>
    </aside>
  );
}
