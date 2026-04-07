import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarDays, Search } from "lucide-react";

import EventsFeedClient, {
  type EventFeedItem,
} from "@/components/events-feed-client";
import ContactsSidebar from "@/components/shared/contacts-sidebar";
import NavigationSidebar from "@/components/shared/navigation-sidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type PaginatedEventsResponse = {
  data: EventFeedItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
};

async function fetchEvents(accessToken?: string, page = 1, limit = 6): Promise<PaginatedEventsResponse> {
  if (!accessToken) {
    console.log("[Events] No access token found");
    return { data: [], meta: null };
  }

  try {
    const url = `${BASE_URL}/events/paginated?page=${page}&limit=${limit}`;
    console.log("[Events] Fetching:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("[Events] Response status:", res.status);
    const result = await res.json();
    console.log("[Events] Response data:", result);

    if (!res.ok || !result?.success) {
      console.log("[Events] API error:", result?.message);
      return { data: [], meta: null };
    }

    return {
      data: Array.isArray(result?.data) ? result.data : [],
      meta: result?.meta ?? null,
    };
  } catch (error) {
    console.error("[Events] Failed to fetch events:", error);
    return { data: [], meta: null };
  }
}

export default async function EventsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const eventsResponse = await fetchEvents(accessToken);
  const events = eventsResponse.data;
  const total = eventsResponse.meta?.total ?? events.length;
  const limit = eventsResponse.meta?.limit ?? 6;
  const hasMore = total > events.length;
console.log("[EventsPage] Total events:", total, "Fetched:", events, "Has more:", hasMore);
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f6f1ea_0%,#efe6db_55%,#e8ddd1_100%)]">
      <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <NavigationSidebar />

          <section className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Events feed
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Browse nearby community events
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Same home-style layout, but centered around upcoming meetups and community activities.
                  </p>
                </div>

                <div className="flex w-full items-center gap-3 rounded-full border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:max-w-xs">
                  <Search className="h-4 w-4" />
                  <span>Search events, places, people</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={accessToken ? "/create-event" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <CalendarDays className="h-4 w-4" />
                  Create event
                </Link>

                <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 px-5 py-3 text-sm leading-6 text-muted-foreground">
                  {accessToken
                    ? "Live events are loading from your backend feed."
                    : "Log in to load the live events feed from your backend."}
                </div>
              </div>
            </div>

            <EventsFeedClient initialItems={events} initialHasMore={hasMore} pageSize={limit} />
          </section>

          <ContactsSidebar
            description="Right sidebar currently uses demo online user data, same as home page."
          />
        </div>
      </div>      
    </main>
  );
}
