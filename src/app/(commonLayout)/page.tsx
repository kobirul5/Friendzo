/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type FeedUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

type MemoryItem = {
  id: string;
  image?: string | null;
  description?: string | null;
  address?: string | null;
  createdAt: string;
  totalLikes?: number;
  totalComments?: number;
  user?: FeedUser;
};

async function fetchFeed<T>(path: string, accessToken?: string): Promise<T[]> {
  if (!accessToken) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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
    console.error(`Failed to fetch ${path}:`, error);
    return [];
  }
}

function getUserName(user?: FeedUser) {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.email || "Friendzo user";
}

function formatDate(value?: string) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/75 px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function FeedCard({
  item,
}: {
  item: MemoryItem;
}) {
  const userName = getUserName(item.user);
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_-42px_rgba(88,70,52,0.45)]">
      <div className="relative min-h-[360px] bg-[linear-gradient(160deg,rgba(92,78,63,0.08),rgba(232,220,209,0.55))]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.description || "Memory cover"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-white/10" />

        <div className="relative flex h-full min-h-[360px] flex-col justify-between p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
              {formatDate(item.createdAt)}
            </span>
            <span className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md">
              Memories
            </span>
          </div>

          <div className="space-y-5">
            <div className="max-w-xl">
              <p className="text-2xl font-semibold leading-tight text-white md:text-[1.9rem]">
                {item.description || "A new memory was shared on Friendzo."}
              </p>
              {item.address ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{item.address}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-end justify-between gap-4">
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
                  <p className="text-xs text-white/75">Shared with the community</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-full bg-white/15 px-4 py-3 text-white backdrop-blur-md">
                <span className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4" />
                  {item.totalLikes ?? 0}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  {item.totalComments ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeedColumn({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: MemoryItem[];
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_70px_-46px_rgba(88,70,52,0.5)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              Community feed
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
          </div>
          <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            {items.length} posts
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No memories yet"
          description="When people start sharing memories, they will appear here."
        />
      )}
    </section>
  );
}

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const memories = await fetchFeed<MemoryItem>("/memories/all-memories", accessToken);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(231,218,204,0.85),transparent_28%),radial-gradient(circle_at_top_right,rgba(216,203,191,0.7),transparent_24%),linear-gradient(180deg,#fbf7f2_0%,#f3ede6_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/55 p-6 shadow-[0_24px_80px_-44px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary/75">
                Friendzo home
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                One clean home feed for memories.
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                The old homepage sections are removed. Now the home page only shows the full
                memories feed in a clean single-column layout.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {accessToken ? (
                <Link
                  href="/create-memory"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <ImagePlus className="h-4 w-4" />
                  Create memory
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <ImagePlus className="h-4 w-4" />
                  Create memory
                </Link>
              )}
            </div>
          </div>

          {!accessToken ? (
            <div className="mt-6 rounded-[1.6rem] border border-primary/10 bg-primary/5 px-5 py-4 text-sm leading-6 text-muted-foreground">
              The live memories feed is protected by auth, so all memories will appear here after
              login.
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-primary/10 bg-primary/5 px-5 py-4 text-sm leading-6 text-muted-foreground">
              All memories are being loaded from the existing backend API and shown below.
            </div>
          )}
        </section>

        <div className="mt-8">
          <FeedColumn
            title="Memories"
            subtitle="All community memories with image, author, likes and comments."
            items={memories}
          />
        </div>
      </div>
    </main>
  );
}
