"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Compass,
  Home as HomeIcon,
  Info,
  UserCircle2,
} from "lucide-react";

const sidebarLinks = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "About Us", href: "/about", icon: Info },
];

const onlineUsers = [
  { id: "1", name: "Ariana Sen", handle: "@ariana", mood: "Planning a meetup" },
  { id: "2", name: "Rafi Ahmed", handle: "@rafi", mood: "Sharing travel shots" },
  { id: "3", name: "Maya Noor", handle: "@maya", mood: "Looking for new friends" },
  { id: "4", name: "Tanvir Joy", handle: "@tanvir", mood: "Online and active" },
  { id: "5", name: "Lamia Tasnim", handle: "@lamia", mood: "Commenting on memories" },
];

export default function CommonLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f6f1ea_0%,#efe6db_55%,#e8ddd1_100%)]">
      <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-5">
              <div className="overflow-hidden rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Navigation
                </p>
                <div className="mt-4 space-y-2">
                  {sidebarLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`);

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
            </div>
          </aside>

          <section className="min-w-0">{children}</section>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-[2rem] border border-white/65 bg-white/82 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                      Contacts
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">Online now</h2>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {onlineUsers.length} active
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {onlineUsers.map((user) => {
                    const initials = user.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("");

                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-2xl bg-muted/25 px-3 py-3"
                      >
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                          {initials || "F"}
                          <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.handle}</p>
                          <p className="truncate text-xs text-muted-foreground/90">{user.mood}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/65 bg-white/82 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Demo contacts panel</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This right sidebar currently uses demo online users for all common layout pages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
