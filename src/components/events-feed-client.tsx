/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, LoaderCircle, MapPin, Sparkles } from "lucide-react";

type FeedUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

export type EventFeedItem = {
  id: string;
  image?: string | null;
  description?: string | null;
  address?: string | null;
  createdAt: string;
  distanceInKm?: number | null;
  user?: FeedUser;
};

type PaginatedEventsClientResponse = {
  success?: boolean;
  message?: string;
  data?: EventFeedItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
};

function getUserName(user?: FeedUser) {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.email || "Friendzo user";
}

function formatDate(value?: string) {
  if (!value) {
    return "Upcoming";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Upcoming";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function EventsFeedClient({
  initialItems,
  initialHasMore,
  pageSize,
}: {
  initialItems: EventFeedItem[];
  initialHasMore: boolean;
  pageSize: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialHasMore, initialItems]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          void loadMoreEvents();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, page]);

  const loadMoreEvents = async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadingMessage("");

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/events/paginated?page=${nextPage}&limit=${pageSize}`, {
        method: "GET",
        cache: "no-store",
      });

      const result: PaginatedEventsClientResponse = await res.json();

      if (!res.ok || !result.success) {
        setLoadingMessage(result.message || "Failed to load more events.");
        return;
      }

      const nextItems = Array.isArray(result.data) ? result.data : [];
      const meta = result.meta;

      setItems((current) => {
        const currentIds = new Set(current.map((item) => item.id));
        const merged = nextItems.filter((item) => !currentIds.has(item.id));
        return [...current, ...merged];
      });
      setPage(nextPage);

      if (!meta) {
        setHasMore(nextItems.length >= pageSize);
      } else {
        setHasMore(meta.page * meta.limit < meta.total);
      }
    } catch (error) {
      console.error("Failed to lazy load events:", error);
      setLoadingMessage("Something went wrong while loading more events.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_70px_-46px_rgba(88,70,52,0.5)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              Community feed
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Events</h2>
          </div>
          <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            {items.length} posts
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nearby community events loaded from the paginated backend API with lazy loading.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map((item) => {
            const userName = getUserName(item.user);
            const initials = userName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("");

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_-42px_rgba(88,70,52,0.45)]"
              >
                <div className="relative min-h-[340px] bg-[linear-gradient(160deg,rgba(92,78,63,0.08),rgba(232,220,209,0.55))]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.description || "Event cover"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-white/10" />

                  <div className="relative flex h-full min-h-[340px] flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md">
                        Events
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div className="max-w-xl">
                        <p className="text-2xl font-semibold leading-tight text-white md:text-[1.9rem]">
                          {item.description || "A new event is happening on Friendzo."}
                        </p>
                        {item.address ? (
                          <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                            <MapPin className="h-4 w-4" />
                            <span>{item.address}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-center gap-3">
                          {item.user?.profileImage ? (
                            <img
                              src={item.user.profileImage}
                              alt={userName}
                              className="h-12 w-12 rounded-full border-2 border-white/60 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-sm font-semibold text-white">
                              {initials || "F"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{userName}</p>
                            <p className="text-xs text-white/75">Hosting this event</p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-md">
                          <CalendarDays className="h-4 w-4" />
                          {item.distanceInKm != null
                            ? `${item.distanceInKm.toFixed(1)} km away`
                            : "Upcoming event"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {hasMore ? (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              {isLoadingMore ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading more events...
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Scroll to load more events</div>
              )}
            </div>
          ) : null}

          {loadingMessage ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {loadingMessage}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/75 px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No events yet</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            When people create events nearby, they will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
