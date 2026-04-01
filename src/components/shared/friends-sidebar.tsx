import Link from "next/link";
import { Bell, Lightbulb, Users } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type SidebarUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  address?: string | null;
};

type FollowerRequestItem = {
  id?: string;
  follower?: SidebarUser;
};

async function fetchFriends(accessToken?: string) {
  if (!accessToken) return [] as SidebarUser[];

  try {
    const response = await fetch(`${BASE_URL}/follow/friends`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [] as SidebarUser[];

    const result = await response.json();
    return Array.isArray(result?.data?.friends) ? result.data.friends : [];
  } catch (error) {
    console.error("Failed to load sidebar friends:", error);
    return [] as SidebarUser[];
  }
}

async function fetchSuggestedUsers(accessToken?: string) {
  if (!accessToken) return [] as SidebarUser[];

  try {
    const response = await fetch(`${BASE_URL}/follow/suggested-user`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [] as SidebarUser[];

    const result = await response.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to load suggested users:", error);
    return [] as SidebarUser[];
  }
}

async function fetchFollowerRequests(accessToken?: string) {
  if (!accessToken) return [] as SidebarUser[];

  try {
    const response = await fetch(`${BASE_URL}/follow/follower-request`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [] as SidebarUser[];

    const result = await response.json();
    const rawItems = Array.isArray(result?.data) ? result.data : [];

    return rawItems
      .map((item: FollowerRequestItem) => item.follower)
      .filter((user: SidebarUser | undefined): user is SidebarUser => Boolean(user));
  } catch (error) {
    console.error("Failed to load follower requests:", error);
    return [] as SidebarUser[];
  }
}

function getUserName(user: SidebarUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Unknown user";
}

function UserList({
  users,
  emptyText,
}: {
  users: SidebarUser[];
  emptyText: string;
}) {
  if (!users.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {users.slice(0, 5).map((user) => {
        const name = getUserName(user);
        const initials = name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("");

        return (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="flex items-center gap-3 rounded-2xl bg-muted/25 px-3 py-3 transition-colors hover:bg-primary/8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials || "F"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.address || "Location not shared"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function FriendsSidebar({
  accessToken,
}: {
  accessToken?: string;
}) {
  const [friends, suggestions, requests] = await Promise.all([
    fetchFriends(accessToken),
    fetchSuggestedUsers(accessToken),
    fetchFollowerRequests(accessToken),
  ]);

  return (
    <aside className="space-y-5">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">All Friends</p>
            <p className="text-xs text-muted-foreground">{friends.length} connected people</p>
          </div>
        </div>
        <UserList users={friends} emptyText="No friends found yet." />
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Suggestions</p>
            <p className="text-xs text-muted-foreground">{suggestions.length} people you may know</p>
          </div>
        </div>
        <UserList users={suggestions} emptyText="No suggestions available right now." />
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">New Requests</p>
            <p className="text-xs text-muted-foreground">{requests.length} pending followers</p>
          </div>
        </div>
        <UserList users={requests} emptyText="No new requests right now." />
      </div>
    </aside>
  );
}
