"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Lightbulb,
  LoaderCircle,
  MapPin,
  MessageCircleMore,
  Users,
} from "lucide-react";
import { FindFriendRequestButton } from "@/components/find-friend-request-button";

type SidebarTab = "friends" | "suggestions" | "requests";

type NetworkUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
  address?: string | null;
  interests?: string[];
  distanceInKm?: number;
};

type FollowerRequestItem = {
  id?: string;
  follower?: NetworkUser;
};

type FriendsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    friends?: NetworkUser[];
  };
};

type NetworkListResponse = {
  success?: boolean;
  message?: string;
  data?: NetworkUser[] | FollowerRequestItem[];
};

const tabs: {
  key: SidebarTab;
  label: string;
  icon: typeof Users;
  endpoint: string;
}[] = [
  { key: "friends", label: "All Friends", icon: Users, endpoint: "/api/network/friends" },
  { key: "suggestions", label: "Suggestions", icon: Lightbulb, endpoint: "/api/network/suggestions" },
  { key: "requests", label: "New Requests", icon: Bell, endpoint: "/api/network/requests" },
];

function getUserName(user: NetworkUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Unknown user";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeUsers(tab: SidebarTab, payload: FriendsResponse | NetworkListResponse) {
  if (tab === "friends") {
    return Array.isArray((payload as FriendsResponse)?.data?.friends)
      ? (payload as FriendsResponse).data?.friends ?? []
      : [];
  }

  if (tab === "requests") {
    const rawItems = Array.isArray((payload as NetworkListResponse)?.data)
      ? ((payload as NetworkListResponse).data as FollowerRequestItem[])
      : [];

    return rawItems
      .map((item) => item.follower)
      .filter((user): user is NetworkUser => Boolean(user));
  }

  return Array.isArray((payload as NetworkListResponse)?.data)
    ? ((payload as NetworkListResponse).data as NetworkUser[])
    : [];
}

export default function FriendsNetworkBrowser({
  defaultTab = "friends",
  pageTitle,
  pageDescription,
}: {
  defaultTab?: SidebarTab;
  pageTitle: string;
  pageDescription: string;
}) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const selectedTab = tabs.find((tab) => tab.key === activeTab);
        if (!selectedTab) return;

        const res = await fetch(selectedTab.endpoint, {
          method: "GET",
          cache: "no-store",
        });

        const result = (await res.json()) as FriendsResponse | NetworkListResponse;

        if (ignore) return;

        if (!res.ok || result?.success === false) {
          setUsers([]);
          setMessage(result?.message || "Failed to load data.");
          return;
        }

        setUsers(normalizeUsers(activeTab, result));
      } catch (error) {
        if (ignore) return;
        console.error("Failed to load network tab:", error);
        setUsers([]);
        setMessage("Something went wrong while loading data.");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const selectedTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Network
        </p>
        <div className="mt-5 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/25 text-foreground hover:bg-primary/8"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                {selectedTab.label}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {pageTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {pageDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <selectedTab.icon className="h-4 w-4" />
              <span>{users.length} users found</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-12 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)]">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading {selectedTab.label.toLowerCase()}...</span>
          </div>
        ) : users.length ? (
          <section className="grid grid-cols-1 gap-4">
            {users.map((user) => {
              const name = getUserName(user);
              const initials = getInitials(name);
              const isSuggestions = activeTab === "suggestions";
              const showMessage = activeTab === "friends";

              return (
                <article
                  key={user.id}
                  className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_20px_50px_-40px_rgba(88,70,52,0.45)]"
                >
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials || "F"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold text-foreground">{name}</h2>
                        <p className="truncate text-sm text-muted-foreground">
                          {user.email || user.address || "Friendzo user"}
                        </p>
                        {user.address ? (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{user.address}</span>
                          </div>
                        ) : null}
                      </div>
                    </Link>

                    {showMessage ? (
                      <Link
                        href={`/messages?friendId=${user.id}&friendName=${encodeURIComponent(name)}`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-0.5"
                        aria-label={`Message ${name}`}
                      >
                        <MessageCircleMore className="h-5 w-5" />
                      </Link>
                    ) : null}
                  </div>

                  {user.interests?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.interests.slice(0, 4).map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {isSuggestions ? (
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <FindFriendRequestButton userId={user.id} />
                      <p className="text-sm text-muted-foreground">
                        Distance:{" "}
                        <span className="font-medium text-foreground">
                          {typeof user.distanceInKm === "number"
                            ? `${user.distanceInKm} km`
                            : "Unknown"}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
            <selectedTab.icon className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No {selectedTab.label.toLowerCase()} found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {message || `No data available for ${selectedTab.label.toLowerCase()} right now.`}
            </p>
          </section>
        )}
      </section>
    </div>
  );
}
