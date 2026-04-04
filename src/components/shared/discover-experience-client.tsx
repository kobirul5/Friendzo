"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Flame, LoaderCircle, MapPin, Sparkles, TrendingUp, Users } from "lucide-react";

import { FindFriendRequestButton } from "@/components/find-friend-request-button";
import { Button } from "@/components/ui/button";

type InterestItem = { name: string; image?: string | null };
type DiscoverTab = "match" | "around" | "buzz";
type DiscoverUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  address?: string | null;
  dob?: string | number | null;
  interestPercentage?: number;
  distanceKm?: number;
  distanceInKm?: number;
  email?: string | null;
};
type TodayBuzzEvent = {
  id: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  location?: string | null;
  distanceInKm?: number;
};
type ApiListResponse<T> = { success?: boolean; message?: string; data?: T };
type TodayBuzzResponse = { todaysEvents?: TodayBuzzEvent[]; users?: DiscoverUser[] };

const TAB_OPTIONS: { key: DiscoverTab; label: string; icon: typeof Sparkles }[] = [
  { key: "match", label: "Matches", icon: Sparkles },
  { key: "around", label: "Around me", icon: MapPin },
  { key: "buzz", label: "Today's Buzz", icon: Flame },
];

const FALLBACK_NEARBY_QUERY =
  "lat=23.838795534051853&lng=90.38317015755169&minDistance=0&maxDistance=12";
const FALLBACK_INTEREST_IMAGE = "/fallback.jpg";

function getUserName(user: DiscoverUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Friendzo User";
}

function getUserAge(dob?: string | number | null) {
  if (!dob) return null;
  const parsedDate = new Date(dob);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return new Date().getFullYear() - parsedDate.getFullYear();
}

function getDistanceLabel(user: DiscoverUser) {
  const distance = typeof user.distanceKm === "number" ? user.distanceKm : user.distanceInKm;
  return typeof distance === "number" ? `${distance.toFixed(1)} km away` : "Nearby now";
}

function UserHighlightCard({ user, badge }: { user: DiscoverUser; badge: string }) {
  const name = getUserName(user);
  const age = getUserAge(user.dob);
  const locationLabel = user.address?.split(",")[0] || user.email || "Friendzo";

  return (
    <Link
      href={`/profile/${user.id}`}
      className="group relative block min-w-[210px] overflow-hidden rounded-[1.8rem] border border-white/50 bg-muted/30 shadow-[0_20px_50px_-35px_rgba(88,70,52,0.45)]"
    >
      <div className="relative aspect-[0.78]">
        {user.profileImage ? (
          <Image src={user.profileImage} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(157,126,96,0.9),rgba(99,76,55,0.95))] text-4xl font-bold text-white/85">
            {name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {badge}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-lg font-semibold">
            {name}
            {age ? `, ${age}` : ""}
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/75">{locationLabel}</p>
          <p className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {getDistanceLabel(user)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function NearbyUserRow({ user }: { user: DiscoverUser }) {
  const name = getUserName(user);

  return (
    <article className="flex items-center justify-between gap-4 rounded-[1.7rem] border border-white/60 bg-white/88 px-4 py-4 shadow-[0_18px_45px_-35px_rgba(88,70,52,0.45)]">
      <Link href={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-primary/10">
          {user.profileImage ? (
            <Image src={user.profileImage} alt={name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
              {name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{name}</h3>
          <p className="truncate text-sm text-muted-foreground">{user.address || user.email || "Discovering nearby people"}</p>
          <p className="mt-1 text-xs font-medium text-primary">{getDistanceLabel(user)}</p>
        </div>
      </Link>
      <FindFriendRequestButton userId={user.id} />
    </article>
  );
}

function EventCard({ event }: { event: TodayBuzzEvent }) {
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/90 shadow-[0_18px_45px_-35px_rgba(88,70,52,0.45)]">
      <div className="relative aspect-[1.8] bg-[linear-gradient(140deg,rgba(244,224,197,0.95),rgba(190,156,121,0.95))]">
        {event.image ? (
          <Image src={event.image} alt={event.title || "Today's buzz event"} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-full bg-white/70 p-4 text-primary">
              <CalendarDays className="h-7 w-7" />
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-foreground">{event.title || "Community event"}</p>
          <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            {typeof event.distanceInKm === "number" ? `${event.distanceInKm.toFixed(1)} km` : "Today"}
          </span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{event.description || "People around you are talking about this event today."}</p>
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{event.location || "Nearby location"}</span>
        </p>
      </div>
    </article>
  );
}

export default function DiscoverExperienceClient({ interests }: { interests: InterestItem[] }) {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("match");
  const [selectedInterest, setSelectedInterest] = useState<string>(interests[0]?.name ?? "Gaming");
  const [matchUsers, setMatchUsers] = useState<DiscoverUser[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<DiscoverUser[]>([]);
  const [buzzUsers, setBuzzUsers] = useState<DiscoverUser[]>([]);
  const [buzzEvents, setBuzzEvents] = useState<TodayBuzzEvent[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [isBuzzLoading, setIsBuzzLoading] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [buzzMessage, setBuzzMessage] = useState("");
  const [interestImageErrors, setInterestImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;
    const loadMatches = async () => {
      setIsMatchLoading(true);
      setMatchMessage("");
      try {
        const params = new URLSearchParams({ interest: selectedInterest, page: "1", limit: "8" });
        const res = await fetch(`/api/network/discover/match?${params.toString()}`, { cache: "no-store" });
        const result = (await res.json()) as ApiListResponse<DiscoverUser[]>;
        if (ignore) return;
        if (!res.ok || result.success === false) {
          setMatchUsers([]);
          setMatchMessage(result.message || "Similar people could not be loaded.");
          return;
        }
        setMatchUsers(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (ignore) return;
        console.error("Failed to load match users:", error);
        setMatchUsers([]);
        setMatchMessage("Similar people could not be loaded.");
      } finally {
        if (!ignore) setIsMatchLoading(false);
      }
    };
    void loadMatches();
    return () => {
      ignore = true;
    };
  }, [selectedInterest]);

  useEffect(() => {
    let ignore = false;
    const loadNearbyUsers = async () => {
      setIsNearbyLoading(true);
      setNearbyMessage("");
      try {
        const res = await fetch(`/api/network/discover?${FALLBACK_NEARBY_QUERY}`, { cache: "no-store" });
        const result = (await res.json()) as ApiListResponse<DiscoverUser[]>;
        if (ignore) return;
        if (!res.ok || result.success === false) {
          setNearbyUsers([]);
          setNearbyMessage(result.message || "Nearby people could not be loaded.");
          return;
        }
        setNearbyUsers(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (ignore) return;
        console.error("Failed to load nearby users:", error);
        setNearbyUsers([]);
        setNearbyMessage("Nearby people could not be loaded.");
      } finally {
        if (!ignore) setIsNearbyLoading(false);
      }
    };
    void loadNearbyUsers();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadBuzz = async () => {
      setIsBuzzLoading(true);
      setBuzzMessage("");
      try {
        const res = await fetch("/api/network/discover/today-buzz", { cache: "no-store" });
        const result = (await res.json()) as ApiListResponse<TodayBuzzResponse>;
        if (ignore) return;
        if (!res.ok || result.success === false) {
          setBuzzEvents([]);
          setBuzzUsers([]);
          setBuzzMessage(result.message || "Today's buzz could not be loaded.");
          return;
        }
        setBuzzEvents(Array.isArray(result.data?.todaysEvents) ? result.data?.todaysEvents ?? [] : []);
        setBuzzUsers(Array.isArray(result.data?.users) ? result.data?.users ?? [] : []);
      } catch (error) {
        if (ignore) return;
        console.error("Failed to load today's buzz:", error);
        setBuzzEvents([]);
        setBuzzUsers([]);
        setBuzzMessage("Today's buzz could not be loaded.");
      } finally {
        if (!ignore) setIsBuzzLoading(false);
      }
    };
    void loadBuzz();
    return () => {
      ignore = true;
    };
  }, []);

  const showLoading =
    (activeTab === "match" && isMatchLoading) ||
    (activeTab === "around" && isNearbyLoading) ||
    (activeTab === "buzz" && isBuzzLoading);
  const emptyMessage =
    activeTab === "match"
      ? matchMessage || "No similar profiles found for this interest."
      : activeTab === "around"
        ? nearbyMessage || "No nearby people found right now."
        : buzzMessage || "No trending activity found for today.";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_24px_70px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
        <div className="relative overflow-hidden px-5 py-6 sm:px-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(198,167,131,0.32),transparent_55%),radial-gradient(circle_at_top_right,rgba(240,220,190,0.65),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Explore people</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Discover your next circle</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Pick an interest, browse similar profiles, switch to nearby people, or check what is buzzing today.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[320px]">
              <div className="rounded-[1.4rem] bg-primary/7 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Interest</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{selectedInterest}</p>
              </div>
              <div className="rounded-[1.4rem] bg-primary/7 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Matches</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{matchUsers.length}</p>
              </div>
              <div className="rounded-[1.4rem] bg-primary/7 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Buzz</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{buzzEvents.length + buzzUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="relative mt-6 flex w-full gap-3 overflow-x-auto pb-2">
            {interests.map((interest) => {
              const isActive = interest.name === selectedInterest;
              return (
                <button
                  key={interest.name}
                  type="button"
                  onClick={() => {
                    setSelectedInterest(interest.name);
                    setActiveTab("match");
                  }}
                  className={`group relative min-w-[150px] overflow-hidden rounded-[1.5rem] border text-left transition-transform hover:-translate-y-0.5 ${
                    isActive ? "border-primary/40 shadow-[0_18px_35px_-28px_rgba(88,70,52,0.6)]" : "border-white/55"
                  }`}
                >
                  <div className="relative h-28">
                    <Image
                      src={(!interestImageErrors.has(interest.name) && interest.image) ? interest.image : FALLBACK_INTEREST_IMAGE}
                      alt={interest.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() =>
                        setInterestImageErrors((prev) => new Set(prev).add(interest.name))
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-sm font-semibold text-white">{interest.name}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-5 py-6 text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "border border-border/70 bg-white text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      {activeTab === "match" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Similar interest</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{selectedInterest} matches</h2>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground">Swipe through profiles from right to left</div>
          </div>
          {showLoading ? (
            <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-12">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading similar profiles...</span>
            </div>
          ) : matchUsers.length ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {matchUsers.map((user) => (
                <UserHighlightCard key={user.id} user={user} badge={`${user.interestPercentage ?? 0}% match`} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      ) : null}
      {activeTab === "around" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Nearby people</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Around me</h2>
              <p className="mt-2 text-sm text-muted-foreground">People within your nearby distance window.</p>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground">{nearbyUsers.length} nearby profiles</div>
          </div>
          {showLoading ? (
            <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-12">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Finding nearby people...</span>
            </div>
          ) : nearbyUsers.length ? (
            <div className="space-y-4">
              {nearbyUsers.map((user) => (
                <NearbyUserRow key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      ) : null}
      {activeTab === "buzz" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Live energy</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Today&apos;s Buzz</h2>
              <p className="mt-2 text-sm text-muted-foreground">Nearby events and active people gaining attention today.</p>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground">{buzzEvents.length} events, {buzzUsers.length} people</div>
          </div>
          {showLoading ? (
            <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-12">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading today&apos;s buzz...</span>
            </div>
          ) : buzzEvents.length || buzzUsers.length ? (
            <div className="space-y-6">
              {buzzEvents.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {buzzEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : null}
              {buzzUsers.length ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Active people near you</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {buzzUsers.map((user) => (
                      <div key={user.id} className="rounded-[1.8rem] border border-white/60 bg-white/90 p-4 shadow-[0_18px_45px_-35px_rgba(88,70,52,0.45)]">
                        <div className="flex items-start gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-primary/10">
                            {user.profileImage ? (
                              <Image src={user.profileImage} alt={getUserName(user)} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                                {getUserName(user).charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold text-foreground">{getUserName(user)}</p>
                            <p className="truncate text-sm text-muted-foreground">{user.email || user.address || "Active today"}</p>
                            <p className="mt-2 text-xs font-medium text-primary">{getDistanceLabel(user)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <Link href={`/profile/${user.id}`} className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5">
                            <Users className="h-4 w-4 text-primary" />
                            View profile
                          </Link>
                          <FindFriendRequestButton userId={user.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      ) : null}
    </section>
  );
}
