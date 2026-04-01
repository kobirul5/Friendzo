import Link from "next/link";
import { cookies } from "next/headers";
import {
  CalendarDays,
  ChevronRight,
  Compass,
  Home as HomeIcon,
  ImagePlus,
  Info,
  Search,
  UserCircle2,
} from "lucide-react";
import jwt from "jsonwebtoken";

import MemoriesFeedClient, {
  type MemoryFeedItem,
} from "@/components/memories-feed-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const sidebarLinks = [
  { name: "Home", href: "/", icon: HomeIcon, active: true },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Explore", href: "/services", icon: Compass },
  { name: "About Us", href: "/about", icon: Info },
];

const onlineUsers = [
  { id: "1", name: "Ariana Sen", handle: "@ariana", mood: "Planning a meetup" },
  { id: "2", name: "Rafi Ahmed", handle: "@rafi", mood: "Sharing travel shots" },
  { id: "3", name: "Maya Noor", handle: "@maya", mood: "Looking for new friends" },
  { id: "4", name: "Tanvir Joy", handle: "@tanvir", mood: "Online and active" },
  { id: "5", name: "Lamia Tasnim", handle: "@lamia", mood: "Commenting on memories" },
];

type PaginatedMemoriesResponse<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
};

async function fetchPaginatedMemories(
  accessToken?: string,
  page = 1,
  limit = 6
): Promise<PaginatedMemoriesResponse<MemoryFeedItem>> {
  if (!accessToken) {
    return { data: [], meta: null };
  }

  try {
    const res = await fetch(`${BASE_URL}/memories/paginated?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: [], meta: null };
    }

    const result = await res.json();
    return {
      data: Array.isArray(result?.data) ? result.data : [],
      meta: result?.meta ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch paginated memories:", error);
    return { data: [], meta: null };
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  let currentUserId: string | null = null;

  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken) as { id?: string } | null;
      currentUserId = decoded?.id || null;
    } catch (error) {
      console.error("JWT decode error on home page:", error);
    }
  }

  const memoriesResponse = await fetchPaginatedMemories(accessToken);
  const memories = memoriesResponse.data;
  const total = memoriesResponse.meta?.total ?? memories.length;
  const limit = memoriesResponse.meta?.limit ?? 6;
  const hasMore = total > memories.length;

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

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                          item.active
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

              <div className="rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <p className="text-sm font-semibold text-foreground">Quick action</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Jump straight into posting a new memory from the home feed.
                </p>
                <Link
                  href={accessToken ? "/create-memory" : "/login"}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <ImagePlus className="h-4 w-4" />
                  Create memory
                </Link>
              </div>
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Home feed
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Your community, arranged like a social feed
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Left side keeps your main navigation, center shows memories, and the right side
                    highlights who is online now.
                  </p>
                </div>

                <div className="flex w-full items-center gap-3 rounded-full border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:max-w-xs">
                  <Search className="h-4 w-4" />
                  <span>Search friends, memories, events</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={accessToken ? "/create-memory" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 xl:hidden"
                >
                  <ImagePlus className="h-4 w-4" />
                  Create memory
                </Link>

                <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 px-5 py-3 text-sm leading-6 text-muted-foreground">
                  {accessToken
                    ? "Live memories are loading from your backend feed."
                    : "Log in to load the live memories feed from your backend."}
                </div>
              </div>
            </div>

            <MemoriesFeedClient
              initialItems={memories}
              currentUserId={currentUserId}
              initialHasMore={hasMore}
              pageSize={limit}
            />
          </section>

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
                      Right sidebar currently uses demo online user data as requested. Later we can
                      wire it to live socket presence.
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
