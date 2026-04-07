"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Grid, Gift, CalendarDays, Calendar, Clock, Heart, Package, Inbox, LoaderCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MemoryCard } from "@/components/profile/memory-card";
import { SendPurchasedGiftDialog } from "@/components/profile/send-purchased-gift-dialog";

export type ProfileMemory = {
  id: string;
  image: string;
  description: string;
};

export type ProfileEvent = {
  id: string;
  title?: string;
  image: string;
  description: string;
  startedAt?: string;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean;
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("memories");
  const [giftSection, setGiftSection] = useState<GiftSection>("purchased");
  const [giftCategory, setGiftCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<ProfileGiftItem | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);

  useEffect(() => {
    if (activeTab === "gifts") {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const purchasedGiftsList = gifts?.purchases ? flattenGiftsByCategory(gifts.purchases, giftCategory) : [];
  const receivedGiftsList = gifts?.received ? flattenGiftsByCategory(gifts.received, giftCategory) : [];

  const handleSendClick = (gift: ProfileGiftItem) => {
    if (!isOwnProfile) {
      toast.error("You can only send gifts from your own profile");
      return;
    }
    setSelectedGift(gift);
    setShowSendDialog(true);
  };

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
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <CalendarDays className="h-6 w-6 text-primary" />
                Events Created
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Events you've organized for the community
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events?.map((item) => {
              const eventDate = item.startedAt ? new Date(item.startedAt) : new Date(item.createdAt);
              const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const day = eventDate.getDate();

              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80 shadow-[0_20px_60px_-30px_rgba(88,70,52,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-35px_rgba(88,70,52,0.35)] active:scale-[0.98]"
                >
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col items-center rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                    <span className="text-[10px] font-black tracking-widest text-primary/80">{month}</span>
                    <span className="text-xl font-black leading-none text-foreground">{day}</span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-4/3 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title || "Event"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <CardContent className="p-5">
                    {item.title && (
                      <h4 className="text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-2">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {item.likeCount !== undefined && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60">
                        <Heart className={`h-3.5 w-3.5 ${item.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{item.likeCount} {item.likeCount === 1 ? "like" : "likes"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!events || events.length === 0) && (
            <Card className="overflow-hidden rounded-[2rem] border-dashed border-2 border-primary/15 bg-muted/5 p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/8">
                  <CalendarDays className="h-10 w-10 text-primary/40" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">No events yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first community event and bring people together!
                  </p>
                </div>
              </div>
            </Card>
          )}
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
                            {isOwnProfile && (gift.count || 0) > 0 && (
                              <Button
                                onClick={() => handleSendClick(gift)}
                                size="sm"
                                className="w-full mt-2 h-8 text-xs rounded-lg"
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Send Gift
                              </Button>
                            )}
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

      {/* Send Gift Dialog */}
      {isOwnProfile && selectedGift && (
        <SendPurchasedGiftDialog
          gift={{
            id: selectedGift.id || "",
            name: selectedGift.name || "",
            image: selectedGift.image || "",
            price: selectedGift.price || 0,
            category: selectedGift.category || "",
            count: selectedGift.count || 0,
          }}
          isOpen={showSendDialog}
          onClose={() => setShowSendDialog(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
