import Link from "next/link";
import { cookies } from "next/headers";
import { Search, MapPin, Users } from "lucide-react";
import { FindFriendRequestButton } from "@/components/find-friend-request-button";
import FriendsSidebar from "@/components/shared/friends-sidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type DiscoverUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string | null;
  address?: string;
  interests?: string[];
  distanceInKm?: number;
};

async function fetchDiscoverUsers(accessToken?: string) {
  if (!accessToken) {
    return [] as DiscoverUser[];
  }

  try {
    const response = await fetch(`${BASE_URL}/discoverByInterest`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [] as DiscoverUser[];
    }

    const result = await response.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to load discover users:", error);
    return [] as DiscoverUser[];
  }
}

export default async function FindFriendsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const users = await fetchDiscoverUsers(accessToken);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f8f2eb_0%,#efe4d8_55%,#e6d9cd_100%)]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <FriendsSidebar accessToken={accessToken} />

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Discover people
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    Find friends around you
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    This page opens directly from the navbar and shows users from the backend.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-full border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>{users.length} users found</span>
                </div>
              </div>
            </section>

            {!accessToken ? (
              <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <Users className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Login required</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please log in to view the Find Friends page.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Go to login
                </Link>
              </section>
            ) : users.length ? (
              <section className="grid grid-cols-1 gap-4">
                {users.map((user: any) => {
                  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Unknown user";
                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("");

                  return (
                    <article
                      key={user.id}
                      className="rounded-[1.8rem] flex justify-between border border-white/70 bg-white/88 p-5 shadow-[0_20px_50px_-40px_rgba(88,70,52,0.45)]"
                    >
                      <Link href={`/profile/${user.id}`} className="block flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {initials || "F"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="truncate text-lg font-semibold text-foreground">{name}</h2>
                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{user.address || "Location not shared"}</span>
                          </div>
                        </div>
                      </Link>
                      <div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(user.interests || []).slice(0, 4).map((interest: any) => (
                            <span
                              key={interest}
                              className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-foreground"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>

                        <FindFriendRequestButton userId={user.id} />
                        <p>
                          Distance:{" "}
                          <span className="font-medium text-foreground">
                            {typeof user.distanceInKm === "number" ? `${user.distanceInKm} km` : "Unknown"}
                          </span>
                        </p>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
                <Users className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">No users found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No discover users were returned from the backend yet.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
