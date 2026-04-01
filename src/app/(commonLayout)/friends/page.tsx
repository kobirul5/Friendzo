import Link from "next/link";
import { cookies } from "next/headers";
import { MapPin, MessageCircleMore, Users } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type FriendUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  address?: string | null;
};

async function fetchFriends(accessToken?: string) {
  if (!accessToken) {
    return [] as FriendUser[];
  }

  try {
    const response = await fetch(`${BASE_URL}/follow/friends`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [] as FriendUser[];
    }

    const result = await response.json();
    const friends = result?.data?.friends;

    return Array.isArray(friends) ? friends : [];
  } catch (error) {
    console.error("Failed to fetch friends:", error);
    return [] as FriendUser[];
  }
}

export default async function FriendsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const friends = await fetchFriends(accessToken);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f8f2eb_0%,#efe4d8_55%,#e6d9cd_100%)]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Your network
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  Friends
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Your accepted friends are loaded from the backend `/follow/friends` API.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{friends.length} friends found</span>
              </div>
            </div>
          </section>

          {!accessToken ? (
            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
              <Users className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">Login required</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Please log in to view your friends.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Go to login
              </Link>
            </section>
          ) : friends.length ? (
            <section className="grid gap-4 grid-cols-1">
              {friends.map((friend) => {
                const name =
                  [friend.firstName, friend.lastName].filter(Boolean).join(" ").trim() ||
                  "Unknown friend";
                const initials = name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("");

                return (
                  <article
                    key={friend.id}
                    className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_20px_50px_-40px_rgba(88,70,52,0.45)]"
                  >
                    <div className="flex items-start gap-4">
                      <Link href={`/profile/${friend.id}`} className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials || "F"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-lg font-semibold text-foreground">{name}</h2>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{friend.address || "Location not shared"}</span>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={`/messages?friendId=${friend.id}&friendName=${encodeURIComponent(name)}`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-0.5"
                        aria-label={`Message ${name}`}
                      >
                        <MessageCircleMore className="h-5 w-5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">No friends found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No accepted friends were returned from the backend yet.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
