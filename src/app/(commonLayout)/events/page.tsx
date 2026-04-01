import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarDays } from "lucide-react";

import EventsFeedClient, {
  type EventFeedItem,
} from "@/components/events-feed-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function fetchEvents(accessToken?: string): Promise<EventFeedItem[]> {
  if (!accessToken) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/events/all-events`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const events = await fetchEvents(accessToken);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(231,218,204,0.85),transparent_28%),radial-gradient(circle_at_top_right,rgba(216,203,191,0.7),transparent_24%),linear-gradient(180deg,#fbf7f2_0%,#f3ede6_100%)]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/55 p-6 shadow-[0_24px_80px_-44px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary/75">
                Friendzo events
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Browse nearby community events.
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Events now live on a separate page instead of the home feed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {accessToken ? (
                <Link
                  href="/create-event"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <CalendarDays className="h-4 w-4" />
                  Create event
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <CalendarDays className="h-4 w-4" />
                  Create event
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <EventsFeedClient initialItems={events} />
        </div>
      </div>
    </main>
  );
}
