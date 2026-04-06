import Link from "next/link";
import { cookies } from "next/headers";
import { ImagePlus, Search } from "lucide-react";
import jwt from "jsonwebtoken";

import MemoriesFeedClient, {
  type MemoryFeedItem,
} from "@/components/memories-feed-client";
import ContactsSidebar from "@/components/shared/contacts-sidebar";
import NavigationSidebar from "@/components/shared/navigation-sidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
          <NavigationSidebar>
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
          </NavigationSidebar>

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

          <ContactsSidebar />
        </div>
      </div>
    </main>
  );
}
