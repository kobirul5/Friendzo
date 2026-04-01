"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, Gift, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

type ProfileTabsProps = {
  memories?: ProfileMemory[];
  events?: ProfileEvent[];
  displayName: string;
  profileImage?: string;
};

type ActiveTab = "memories" | "events" | "gifts";

const tabButtonClass = (isActive: boolean) =>
  `relative pb-4 text-lg transition-colors ${
    isActive
      ? "font-black text-foreground after:absolute after:bottom-0 after:left-0 after:h-1.5 after:w-full after:rounded-full after:bg-primary"
      : "font-bold text-muted-foreground hover:text-foreground"
  }`;

export function ProfileTabs({
  memories,
  events,
  displayName,
  profileImage,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("memories");

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
        <Card className="border-dashed bg-muted/10 p-12 text-center">
          <Gift className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No gifts yet</h3>
          <p className="text-sm text-muted-foreground">
            Gifts will appear here when gift data is available.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
