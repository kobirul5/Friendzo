"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Grid, Gift, CalendarDays, Package, Inbox, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/components/profile/memory-card";

export type ProfileMemory = {
  id: string;
  image: string;
  description: string;
};

export type ProfileEvent = {
  id: string;
  image: string;
  description: string;
  createdAt: string;
};

export type ProfileGiftItem = {
  id?: string;
  name?: string | null;
  image?: string | null;
  price?: number | null;
  category?: string | null;
  count?: number | null;
};

export type ProfileGiftsData = {
  purchases: Record<string, ProfileGiftItem[]>;
  received: Record<string, ProfileGiftItem[]>;
};

type ProfileTabsProps = {
  memories?: ProfileMemory[];
  events?: ProfileEvent[];
  gifts?: ProfileGiftsData;
  displayName: string;
  profileImage?: string;
  isOwnProfile?: boolean;
};

type ActiveTab = "memories" | "events" | "gifts";
type GiftSection = "purchased" | "received";

const tabButtonClass = (isActive: boolean) =>
  `relative pb-4 text-lg transition-colors ${
    isActive
      ? "font-black text-foreground after:absolute after:bottom-0 after:left-0 after:h-1.5 after:w-full after:rounded-full after:bg-primary"
      : "font-bold text-muted-foreground hover:text-foreground"
  }`;

const categoryButtonClass = (isActive: boolean) =>
  `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
    isActive
      ? "bg-primary text-primary-foreground shadow-md"
      : "bg-white/60 text-muted-foreground hover:bg-white hover:text-foreground border border-black/5"
  }`;

const GIFT_CATEGORIES = ["ALL", "ESSENTIAL", "EXCLUSIVE", "MAJESTIC"];

function flattenGiftsByCategory(
  giftsData: Record<string, ProfileGiftItem[]>,
  categoryFilter: string
): ProfileGiftItem[] {
  if (categoryFilter === "ALL") {
    return Object.values(giftsData).flat();
  }
  
  // Case-insensitive category matching
  const upperFilter = categoryFilter.toUpperCase();
  for (const [key, value] of Object.entries(giftsData)) {
    if (key.toUpperCase() === upperFilter) {
      return value;
    }
  }
  return [];
}

export function ProfileTabs({
  memories,
  events,
  gifts,
  displayName,
  profileImage,
  isOwnProfile = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("memories");
  const [giftSection, setGiftSection] = useState<GiftSection>("purchased");
  const [giftCategory, setGiftCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "gifts") {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const purchasedGiftsList = gifts?.purchases ? flattenGiftsByCategory(gifts.purchases, giftCategory) : [];
  const receivedGiftsList = gifts?.received ? flattenGiftsByCategory(gifts.received, giftCategory) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-8 border-b pb-1">
        <button
          type="button"
          className={tabButtonClass(activeTab === "memories")}
          onClick={() => setActiveTab("memories")}
        >
          Memories
        </button>
        <button
          type="button"
          className={tabButtonClass(activeTab === "events")}
          onClick={() => setActiveTab("events")}
        >
          Event
        </button>
        <button
          type="button"
          className={tabButtonClass(activeTab === "gifts")}
          onClick={() => setActiveTab("gifts")}
        >
          Gift
        </button>
      </div>

      {activeTab === "memories" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {memories?.map((memory) => (
            <MemoryCard
              key={memory.id}
              image={memory.image}
              description={memory.description}
              userName={displayName}
              userAvatar={profileImage}
            />
          ))}
          {(!memories || memories.length === 0) && (
            <Card className="col-span-2 border-dashed bg-muted/10 p-12 text-center">
              <Grid className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">No memories yet</h3>
              <p className="text-sm text-muted-foreground">
                Share your first memory with the world!
              </p>
            </Card>
          )}
        </div>
      ) : null}

      {activeTab === "events" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight">
              Events Created
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {events?.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden rounded-3xl border-none shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative aspect-video w-full">
                  <Image src={item.image} alt="Event" fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h4 className="truncate line-clamp-1 font-bold">
                    {item.description}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {(!events || events.length === 0) && (
              <Card className="col-span-3 border-dashed bg-muted/10 p-8 text-center">
                <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground italic">
                  No events organized yet
                </p>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "gifts" ? (
        <div className="space-y-6">
          {/* Section Tabs: Purchased / Received */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center rounded-2xl bg-white/60 p-1.5 shadow-sm border border-black/5">
              <button
                onClick={() => { setGiftSection("purchased"); setGiftCategory("ALL"); }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  giftSection === "purchased"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" />
                Purchased
              </button>
              <button
                onClick={() => { setGiftSection("received"); setGiftCategory("ALL"); }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  giftSection === "received"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                <Inbox className="h-4 w-4" />
                Received
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {GIFT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGiftCategory(cat)}
                  className={categoryButtonClass(giftCategory === cat)}
                >
                  {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Gifts...</p>
            </div>
          ) : (
            <>
              {/* Purchased Gifts */}
              {giftSection === "purchased" && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Purchased Gifts ({purchasedGiftsList.reduce((sum, g) => sum + (g.count || 0), 0)})
                  </h3>
                  {purchasedGiftsList.length === 0 ? (
                    <Card className="border-dashed bg-muted/10 p-12 text-center">
                      <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                      <h3 className="text-lg font-semibold">No purchased gifts in this category</h3>
                      <p className="text-sm text-muted-foreground">
                        Buy some gifts from the store to see them here.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {purchasedGiftsList.map((gift, index) => (
                        <Card
                          key={`${gift.id || gift.name}-${index}`}
                          className="group overflow-hidden rounded-2xl border-none shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        >
                          <div className="relative aspect-square">
                            {gift.image ? (
                              <Image
                                src={gift.image}
                                alt={gift.name || "Gift"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                <Gift className="h-12 w-12 text-primary/20" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary">
                              x{gift.count || 0}
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h4 className="text-sm font-bold truncate">{gift.name || "Unknown Gift"}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {gift.category || ""} • {gift.price || 0} coins
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Received Gifts */}
              {giftSection === "received" && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-primary" />
                    Received Gifts ({receivedGiftsList.reduce((sum, g) => sum + (g.count || 0), 0)})
                  </h3>
                  {receivedGiftsList.length === 0 ? (
                    <Card className="border-dashed bg-muted/10 p-12 text-center">
                      <Inbox className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                      <h3 className="text-lg font-semibold">No received gifts in this category</h3>
                      <p className="text-sm text-muted-foreground">
                        {isOwnProfile ? "Friends haven't sent you gifts yet." : "No gifts received yet."}
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {receivedGiftsList.map((gift, index) => (
                        <Card
                          key={`${gift.id || gift.name}-${index}`}
                          className="group overflow-hidden rounded-2xl border-none shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        >
                          <div className="relative aspect-square">
                            {gift.image ? (
                              <Image
                                src={gift.image}
                                alt={gift.name || "Gift"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                <Gift className="h-12 w-12 text-primary/20" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary">
                              x{gift.count || 0}
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h4 className="text-sm font-bold truncate">{gift.name || "Unknown Gift"}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {gift.category || ""} • {gift.price || 0} coins
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
